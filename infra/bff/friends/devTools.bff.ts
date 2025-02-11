import { register } from "infra/bff/bff.ts";
import {
  runningProcesses,
  runShellCommand,
  runShellCommandWithOutput,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";
import { neon } from "@neondatabase/serverless";
import { upsertBfDb } from "packages/bfDb/bfDbUtils.ts";

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

async function stopJupyter() {
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

async function stopPostgres() {
  logger.info("Stopping Postgres...");
  try {
    await runShellCommand(
      ["pkill", "-f", "postgres"],
      undefined,
      {},
      false,
    );
    logger.info("Postgres stopped");
    return 0;
  } catch {
    logger.info("No Postgres process found");
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

// Function to check if Postgres data directory is initialized
async function isPostgresInitialized(dataDir: string): Promise<boolean> {
  try {
    const pgVersion = new Deno.Command("pg_ctl", {
      args: ["-D", dataDir, "status"],
      stdin: "null",
      stdout: "null",
      stderr: "null",
    });
    const status = await pgVersion.output();
    return status.success;
  } catch {
    return false;
  }
}

// Function to initialize Postgres data directory
async function initializePostgres(dataDir: string) {
  try {
    const dirContents = await Deno.readDir(dataDir);
    for await (const _ of dirContents) {
      // Directory exists and has contents, skip initialization
      logger.info(
        "PostgreSQL directory already exists and is not empty, skipping initialization",
      );
      return;
    }
  } catch {
    // Directory doesn't exist, create it
    await Deno.mkdir(dataDir, { recursive: true });
  }

  logger.info("Initializing PostgreSQL database...");
  const initDb = new Deno.Command("initdb", {
    args: ["-D", dataDir],
    stdout: "piped",
    stderr: "piped",
  });

  const { success, stdout, stderr } = await initDb.output();

  if (!success) {
    const errorOutput = new TextDecoder().decode(stderr);
    logger.error("PostgreSQL initialization failed:", errorOutput);
    throw new Error(`Failed to initialize PostgreSQL database: ${errorOutput}`);
  }

  const output = new TextDecoder().decode(stdout);
  logger.info("PostgreSQL initialization output:", output);
  logger.info("PostgreSQL database initialized.");
}

// Function to start PostgreSQL
async function startPostgres() {
  logger.info("Starting local PostgreSQL database...");
  const dataDir = "./tmp/pgdata";

  // Check if Postgres is initialized
  if (!await isPostgresInitialized(dataDir)) {
    await initializePostgres(dataDir);
  }
  // Create required PostgreSQL directories
  await Deno.mkdir("./tmp/postgresql", { recursive: true });
  await Deno.chmod("./tmp/postgresql", 0o777);

  // Start PostgreSQL in the background with custom socket directory
  const postgresProc = new Deno.Command("pg_ctl", {
    args: [
      "-D",
      dataDir,
      "-l",
      "./tmp/postgres.log",
      "-o",
      "-k /home/runner/workspace/tmp/postgresql -h 0.0.0.0",
      "start",
    ],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  // Keep a reference to the running process so we can kill it if needed
  runningProcesses.push(postgresProc);

  // Wait until PostgreSQL is fully ready to accept connections
  await waitForPort(5432, "PostgreSQL");
  logger.info("PostgreSQL started successfully.");

  // Check if bfdb table exists and create if needed
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'bfdb'
    );`;

    if (!result[0]?.exists) {
      logger.info("bfdb table not found, creating...");
      await upsertBfDb();
      logger.info("bfdb table created successfully");
    }
  } catch (error) {
    logger.error("Error checking/creating bfdb table:", error);
    throw error;
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
      await stopPostgres();
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

        // Start Postgres
        startPostgres().catch((error) => {
          logger.error("Failed to start PostgreSQL:", error);
          throw error;
        });

        // Wait for all services to become available
        await Promise.all([
          waitForPort(3011, "Sapling"),
          waitForPort(8888, "Jupyter"),
          waitForPort(5432, "PostgreSQL"),
        ]);

        logger.info("All dev tools (Postgres, Sapling, Jupyter) are ready!");
        return 0;
      } catch (error) {
        logger.error("Failed to start development tools:", error);
        return 1;
      }
    },
  );
});
