import { register } from "infra/bff/bff.ts";
import {
  runningProcesses,
  runShellCommand,
} from "infra/bff/shellBase.ts";
import { getLogger } from "packages/logger.ts";

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

export async function run(): Promise<number> {
    try {
      logger.info("Starting web server and Python backend...");

      // Verify the web binary exists
      try {
        const webBinaryInfo = await Deno.stat("./build/web");
        if (!webBinaryInfo.isFile) {
          throw new Error("Web binary not found");
        }
      } catch (error) {
        logger.error("Web binary not found at ./build/web. Please build it first.");
        return 1;
      }

      // Start web binary
      logger.info("Starting web server...");
      const webProc = new Deno.Command("./build/web", {
        stdin: "null",
        stdout: "piped",
        stderr: "piped",
        env: {
          ...Deno.env.toObject(),
          PYTHON_SERVER_URL: "http://localhost:3333",
          PORT: "3000",  // Explicitly set web server port
        },
      }).spawn();

      // Keep track of the process
      runningProcesses.push(webProc);

      // Handle web server logs
      if (webProc.stdout) {
        (async () => {
          for await (const chunk of webProc.stdout) {
            const text = new TextDecoder().decode(chunk);
            logger.info("[Web] " + text);
          }
        })();
      }

      if (webProc.stderr) {
        (async () => {
          for await (const chunk of webProc.stderr) {
            const text = new TextDecoder().decode(chunk);
            logger.error("[Web] " + text);
          }
        })();
      }

      // Wait for web server to be ready
      logger.info("Waiting for web server to be ready on port 3000...");
      const webReady = await waitForPort(3000, "Web Server");
      if (!webReady) {
        throw new Error("Web server failed to start");
      }

      logger.info("Both servers are ready! Access the web interface at http://localhost:3000");

      // Keep the command running until Ctrl+C
      await new Promise(() => {});

      return 0;
    } catch (error) {
      logger.error("Failed to start servers:", error);
      return 1;
    }
  }

register("run", "Run the compiled web binary and Python server", run);