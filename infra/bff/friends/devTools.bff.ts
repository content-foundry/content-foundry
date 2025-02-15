import { register } from "infra/bff/bff.ts";
import {
  runningProcesses,
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";
import { neon } from "@neondatabase/serverless";
import { upsertBfDb } from "packages/bfDb/bfDbUtils.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

async function checkPort(port: number): Promise<boolean> {
  try {
    const listener = Deno.listen({ port, hostname: "0.0.0.0" });
    listener.close();
    return false;
  } catch {
    return true;
  }
}

async function waitForPort(
  port: number,
  serviceName: string,
  timeout = 60000,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await checkPort(port)) {
      logger.info(`${serviceName} is ready on port ${port}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  logger.error(`Timeout waiting for ${serviceName} on port ${port}`);
  return false;
}

// Install a SIGINT signal listener to terminate child processes on Ctrl+C
Deno.addSignalListener("SIGINT", async () => {
  logger.info("Ctrl+C pressed. Terminating child processes...");
  for (const proc of runningProcesses) {
    try {
      // Check if process is still running before attempting to kill it
      const status = await proc.status;
      if (!status.success) {
        proc.kill("SIGTERM");
      }
    } catch {
      // Process already terminated, skip it
      continue;
    }
  }
  Deno.exit();
});

export async function stopJupyter(): Promise<number> {
  logger.info("Stopping Jupyter...");
  try {
    await runShellCommand(
      ["pkill", "-f", "jupyter-notebook"],
      undefined,
      {},
      false,
    );
    logger.info("Jupyter stopped");
    return 0;
  } catch {
    logger.info("No Jupyter process found");
    return 0;
  }
}

async function stopSapling() {
  logger.info("Stopping Sapling...");
  try {
    await runShellCommand(
      ["sl", "web", "--kill"],
      undefined,
      {},
      false,
    );
    logger.info("Sapling stopped");
    return 0;
  } catch {
    logger.info("No Sapling process found");
    return 0;
  }
}

// Register "devToolStop" / "devToolsStop" commands
["devToolStop", "devToolsStop"].forEach((commandName) => {
  register(
    commandName,
    "Stop all development tools",
    async () => {
      await stopJupyter();
      await stopSapling();
      return 0;
    },
  );
});

register(
  "devToolStopJupyter",
  "Stop Jupyter notebook",
  stopJupyter,
);

register(
  "devToolStopSapling",
  "Stop Sapling web interface",
  stopSapling,
);

// Register both command names
["devTool", "devTools"].forEach((commandName) => {
  register(
    commandName,
    "Run development tools (Postgres, Sapling web interface, Jupyter notebook)",
    async () => {
      // Check GitHub auth status first
      const authStatus = await runShellCommandWithOutput([
        "gh",
        "auth",
        "status",
      ]);

      logger.log("GitHub auth status:", authStatus);
      if (!authStatus) {
        logger.log(`Not authenticated. ${authStatus} Let's log in.`);
        // Setup GitHub auth first
        const ghCommand = new Deno.Command("gh", {
          args: [
            "auth",
            "login",
            "--hostname",
            "github.com",
            "--web",
            "--git-protocol",
            "https",
          ],
          stdin: "piped",
        });
        const ghProcess = ghCommand.spawn();
        const writer = ghProcess.stdin.getWriter();
        await writer.write(new TextEncoder().encode("y\n"));
        await writer.close();
        await ghProcess.status;
      }

      logger.log("Starting Postgres, Jupyter, and Sapling web interface...");

      // Kill any existing Jupyter or Sapling processes
      try {
        await runShellCommand(
          ["pkill", "-f", "jupyter-notebook"],
          undefined,
          {},
          false,
        );
        await runShellCommand(["sl", "web", "--kill"], undefined, {}, false);
      } catch (e) {
        // Ignore errors if no processes were found
      }

      try {
        const env = {
          ...Deno.env.toObject(),
          // Suppress color & buffer output
          NO_COLOR: "1",
          PYTHONUNBUFFERED: "1",
        };

        // Create tmp directory if it doesn't exist
        await Deno.mkdir("./tmp", { recursive: true });

        logger.info("Starting Sapling web interface...");
        const saplingProc = new Deno.Command("sl", {
          args: ["web", "-f", "--no-open"],
          stdin: "null",
          stdout: "piped",
          stderr: "piped",
        }).spawn();

        // Write Sapling logs to file
        const saplingLogFile = await Deno.open("./tmp/sapling.log", {
          write: true,
          create: true,
          truncate: true,
        });
        const saplingWriter = saplingLogFile.writable.getWriter();

        // Handle stdout and stderr asynchronously
        if (saplingProc.stdout) {
          (async () => {
            try {
              for await (const chunk of saplingProc.stdout) {
                await saplingWriter.write(chunk);
              }
            } catch (err) {
              logger.error("Error writing Sapling stdout:", err);
            }
          })();
        }

        if (saplingProc.stderr) {
          (async () => {
            try {
              for await (const chunk of saplingProc.stderr) {
                await saplingWriter.write(chunk);
              }
            } catch (err) {
              logger.error("Error writing Sapling stderr:", err);
            }
          })();
        }
        runningProcesses.push(saplingProc);

        logger.info("Starting Jupyter notebook...");
        await runShellCommand(
          ["deno", "jupyter", "--install"],
          undefined,
          env,
          false,
        );
        const jupyterProc = new Deno.Command("jupyter", {
          args: [
            "notebook",
            "--config",
            "./infra/jupyter/config.py",
            "--ip=0.0.0.0",
            "--port=8888",
            "--no-browser",
          ],
          stdin: "null",
          stdout: "piped",
          stderr: "piped",
        }).spawn();

        // Write Jupyter logs to file
        const jupyterLogFile = await Deno.open("./tmp/jupyter.log", {
          write: true,
          create: true,
          truncate: true,
        });
        const jupyterWriter = jupyterLogFile.writable.getWriter();

        // Handle Jupyter logs asynchronously
        if (jupyterProc.stdout) {
          (async () => {
            try {
              for await (const chunk of jupyterProc.stdout) {
                await jupyterWriter.write(chunk);
              }
            } catch (err) {
              logger.error("Error writing Jupyter stdout:", err);
            }
          })();
        }

        if (jupyterProc.stderr) {
          (async () => {
            try {
              for await (const chunk of jupyterProc.stderr) {
                await jupyterWriter.write(chunk);
              }
            } catch (err) {
              logger.error("Error writing Jupyter stderr:", err);
            }
          })();
        }
        runningProcesses.push(jupyterProc);

        // Wait for all services to become available
        await Promise.all([
          waitForPort(3011, "Sapling"),
          waitForPort(8888, "Jupyter"),
        ]);

        logger.info("All dev tools (Sapling, Jupyter) are ready!");
        return 0;
      } catch (error) {
        logger.error("Failed to start development tools:", error);
        return 1;
      }
    },
  );
});
