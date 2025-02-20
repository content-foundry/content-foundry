import { register } from "infra/bff/bff.ts";
import {
  runningProcesses,
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

async function configureSapling() {
  const XDG_CONFIG_HOME = getConfigurationVariable("XDG_CONFIG_HOME");

  const nameRawPromise = runShellCommandWithOutput([
    "gh",
    "api",
    "/user",
    "--jq",
    ".name",
  ]).then(({ stdout }) => stdout);

  const emailRawPromise = runShellCommandWithOutput([
    "gh",
    "api",
    "/user/emails",
    "--jq",
    ".[0].email",
  ]).then(({ stdout }) => stdout);

  const [nameRaw, emailRaw] = await Promise.all([
    nameRawPromise,
    emailRawPromise,
  ]);

  const hostsYml = await Deno.readTextFile(
    `${XDG_CONFIG_HOME}/gh/hosts.yml`,
  );

  // who needs a yaml parser when you live on the edge?
  const token = hostsYml.split("oauth_token:")[1].trim().split("\n")[0];
  let name = nameRaw.trim();
  if (name == "") {
    logger.warn(
      "\n Github user should create a display name on their profile page.\n",
    );
    name = "unknown Bolt Foundry Replit contributor";
  }
  const email = emailRaw.trim() ?? "unknown@boltfoundry.com";
  const gitFile = `${XDG_CONFIG_HOME}/git/config`;
  try {
    await Deno.remove(gitFile);
  } catch {
    logger.info("no git config file");
  }
  await Promise.all([
    runShellCommand([
      "git",
      "config",
      "--file",
      gitFile,
      `url.https://${token}@github.com/.insteadOf`,
      "https://github.com/",
    ]),
    runShellCommand([
      "sl",
      "config",
      "--user",
      "ui.username",
      `${name} <${email}>`,
    ]),
  ]);
  await runShellCommand([
    "sl",
    "config",
    "--user",
    "github.preferred_submit_command",
    "pr",
  ]);
}

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
    const cmd = ["./packages/web/tools.tsx"];
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
      // Start Tools first
      startTools();

      // Check GitHub auth status first
      const authStatus = await runShellCommandWithOutput([
        "gh",
        "auth",
        "status",
      ]);

      logger.log("GitHub auth status:", authStatus);
      if (!authStatus) {
        logger.info(`Not authenticated. ${authStatus} Let's log in.`);
        logger.warn(
          "The login prompt is for the gh app, but we are only requesting public_repo and user scope.",
        );
        // Setup GitHub auth first
        const ghCommand = new Deno.Command("gh", {
          args: [
            "auth",
            "login",
            "--scopes",
            "public_repo,user",
          ],
          stdin: "piped",
          stdout: "piped",
          stderr: "piped",
        });
        const ghProcess = ghCommand.spawn();

        // 2) Also read from stderr
        if (ghProcess.stderr) {
          (async () => {
            const decoder = new TextDecoder();
            for await (const chunk of ghProcess.stderr) {
              const output = decoder.decode(chunk);

              // GH writes the one-time code lines to stderr. Something like:
              //   ! First copy your one-time code: 1234-ABCD
              //   Open this URL ...
              if (output.includes("First copy your one-time code:")) {
                logger.info("found code!", output);

                // For example, parse out the code with a regex:
                const match = output.match(
                  /First copy your one-time code:\s*(\S+)/,
                );
                if (match) {
                  const code = match[1];
                  logger.info("Parsed code:", code);
                  // Then write it somewhere, e.g.
                  await Deno.mkdir("./tmp", { recursive: true });
                  await Deno.writeTextFile("./tmp/ghcode", code);
                }
              }

              // You might also want to log or parse other lines
              logger.debug("gh (stderr):", output);
            }
          })();
        }

        // // 3) If you’re trying to supply some token or answer to gh’s stdin:
        // const writer = ghProcess.stdin.getWriter();
        // // If you don't actually need to pass anything in, you can skip this altogether
        // await writer.write(new TextEncoder().encode("some input\n"));
        // await writer.close();

        // 4) Await the command’s exit
        await ghProcess.status;
        await Deno.remove("./tmp/ghcode");
      }

      await configureSapling();

      logger.log("Starting Jupyter and Sapling web interface...");

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
        const saplingWriter = isDebug
          ? {
            write: async (chunk: Uint8Array) => {
              await Deno.stdout.write(chunk);
              return;
            },
          }
          : (await Deno.open("./tmp/sapling.log", {
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
        const jupyterWriter = isDebug
          ? {
            write: async (chunk: Uint8Array) => {
              await Deno.stdout.write(chunk);
              return;
            },
          }
          : (await Deno.open("./tmp/jupyter.log", {
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
        // Tools server is already started

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
