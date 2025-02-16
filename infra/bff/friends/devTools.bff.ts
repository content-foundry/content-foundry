import { register } from "infra/bff/bff.ts";
import {
  runningProcesses,
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

function checkPort(port: number): boolean {
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
    if (checkPort(port)) {
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

async function startTools() {
  logger.info("Starting Tools...");
  try {
    const cmd = ["deno", "run", "--allow-net=0.0.0.0,localhost,127.0.0.1", "--allow-env", "./packages/web/tools.tsx"];
    await runShellCommand(cmd);
    logger.info("Tools started successfully");
    return 0;
  } catch (error) {
    logger.error("Failed to start Tools:", error);
    return 1;
  }
}

async function stopTools() {
  logger.info("Stopping Tools...");
  try {
    // Find and kill the process running on port 9999
    await runShellCommand(["pkill", "-f", "tools.tsx"]);
    logger.info("Tools stopped");
    return 0;
  } catch {
    logger.info("No Tools process found");
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
      await stopTools();
      return 0;
    },
  );
});

register(
  "devToolStartTools",
  "Start Tools web interface",
  startTools,
);

register(
  "devToolStopTools",
  "Stop Tools web interface",
  stopTools,
);

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
    async (options: string[]) => {
      const isDebug = options.includes("--debug");
      // Check GitHub auth status first
      const authStatus = await runShellCommandWithOutput([
        "gh",
        "auth",
        "status",
      ]);

      logger.log("GitHub auth status:", authStatus);
      if (!authStatus) {
        // Decide which port to use
        const REPLIT_PID2 = Deno.env.get("REPLIT_PID2") ?? "";
        const REPLIT_SESSION = Deno.env.get("REPLIT_SESSION") ?? "";
        let port = "8283";
        let token;

        if (REPLIT_PID2 === "true") {
          port = "8284";
        }

        // Fetch token from localhost
        try {
          const url = `http://localhost:${port}/${REPLIT_SESSION}/github/token`;
          const response = await fetch(url);

          // If the request is not OK, just print empty string
          if (!response.ok) {
            Deno.exit(0);
          }

          // Parse the JSON and extract the "token" field
          const data = await response.json();
          if (data && typeof data.token === "string") {
            token = data.token;
          }
        } catch (_error) {
          // On any error, print empty string
        }
        logger.info(`Not authenticated. ${authStatus} Let's log in.`);
        logger.warn(
          "The login prompt is for the gh app, but we are only requesting public_repo scope.",
        );
        // Setup GitHub auth first
        const ghCommand = new Deno.Command("gh", {
          args: [
            "auth",
            "login",
            // "--with-token",
            "--scopes",
            "public_repo",
          ],
          stdin: "piped",
        });
        const ghProcess = ghCommand.spawn();
        const writer = ghProcess.stdin.getWriter();
        await writer.write(new TextEncoder().encode(token));
        await writer.close();
        await ghProcess.status;
      }

      logger.log("Starting Jupyter, and Sapling web interface...");

      // Get user info from GitHub API
      const userInfoRaw = await runShellCommandWithOutput([
        "gh",
        "api",
        "user",
      ]);

      // const userEmailRaw = await runShellCommandWithOutput([
      //   "gh",
      //   "api",
      //   "user/emails",
      //   "--jq",
      //   ".[0].email",
      // ]);

      const userInfo = JSON.parse(userInfoRaw);
      const userName = userInfo.name || userInfo.login;
      const userEmail = `${userInfo.login}@users.noreply.github.com`;

      // Configure Sapling username
      await runShellCommand([
        "sl",
        "config",
        "--user",
        "ui.username",
        `${userName} <${userEmail}>`,
      ]);

      // Kill any existing Jupyter or Sapling processes
      try {
        await runShellCommand(
          ["pkill", "-f", "jupyter-notebook"],
          undefined,
          {},
          false,
        );
        await runShellCommand(["sl", "web", "--kill"], undefined, {}, false);
      } catch (_) {
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
          args: ["web", "--foreground", "--no-open"],
          stdin: "null",
          stdout: "piped",
          stderr: "piped",
        }).spawn();

        // Handle Sapling logs
        const saplingWriter = isDebug ? {
          write: async (chunk: Uint8Array) => {
            await Deno.stdout.write(chunk);
            return;
          }
        } : (await Deno.open("./tmp/sapling.log", {
          write: true,
          create: true,
          truncate: true,
        })).writable.getWriter();

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

        // Handle Jupyter logs
        const jupyterWriter = isDebug ? {
          write: async (chunk: Uint8Array) => {
            await Deno.stdout.write(chunk);
            return;
          }
        } : (await Deno.open("./tmp/jupyter.log", {
          write: true,
          create: true,
          truncate: true,
        })).writable.getWriter();

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
        // Start Tools
      logger.info("Starting Tools...");
      const toolsProc = new Deno.Command("./packages/web/tools.tsx", {
        args: [],
        stdin: "null",
        stdout: "piped",
        stderr: "piped",
      }).spawn();

      // Handle Tools logs
      const toolsWriter = isDebug ? {
        write: async (chunk: Uint8Array) => {
          await Deno.stdout.write(chunk);
          return;
        }
      } : (await Deno.open("./tmp/tools.log", {
        write: true,
        create: true,
        truncate: true,
      })).writable.getWriter();

      if (toolsProc.stdout) {
        (async () => {
          try {
            for await (const chunk of toolsProc.stdout) {
              await toolsWriter.write(chunk);
            }
          } catch (err) {
            logger.error("Error writing Tools stdout:", err);
          }
        })();
      }

      if (toolsProc.stderr) {
        (async () => {
          try {
            for await (const chunk of toolsProc.stderr) {
              await toolsWriter.write(chunk);
            }
          } catch (err) {
            logger.error("Error writing Tools stderr:", err);
          }
        })();
      }
      runningProcesses.push(toolsProc);

      await Promise.all([
        waitForPort(3011, "Sapling"),
        waitForPort(8888, "Jupyter"),
        waitForPort(9999, "Tools"),
      ]);

      logger.info("All dev tools (Sapling, Jupyter, Tools) are ready!");
      
      if (isDebug) {
        // Keep the process running in debug mode
        await new Promise(() => {});
      }
      return 0;
      } catch (error) {
        logger.error("Failed to start development tools:", error);
        return 1;
      }
    },
  );
});
