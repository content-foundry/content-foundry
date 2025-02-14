// In infra/bff/shellBase.ts (or a shared module)
import startSpinner from "lib/terminalSpinner.ts";
import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import { register } from "infra/bff/bff.ts";
const logger = getLogger(import.meta);

// Global array to track running child processes
export const runningProcesses: Deno.ChildProcess[] = [];

export async function runShellCommand(
  commandArray: Array<string>,
  cwdString = getConfigurationVariable("REPL_HOME") ?? Deno.cwd(),
  additionalEnv = {},
  useSpinner = true,
  silent = false,
): Promise<number> {
  const env = {
    ...Deno.env.toObject(),
    ...additionalEnv,
  };
  if (!silent) {
    logger.info(`Running command: ${commandArray.join(" ")}`);
  }
  let stopSpinner: (() => void) | undefined;
  if (useSpinner) {
    stopSpinner = startSpinner();
  }

  const cwd = new URL(import.meta.resolve(cwdString));

  const cmd = new Deno.Command(commandArray[0], {
    args: commandArray.slice(1),
    stdout: "inherit",
    stderr: "inherit",
    cwd,
    env,
  });

  const process = cmd.spawn();
  // Save the process so we can kill it later
  runningProcesses.push(process);

  const { code, success } = await process.output();
  if (stopSpinner) {
    stopSpinner();
  }

  if (!silent) {
    if (success) {
      logger.info(`Command succeeded: ${commandArray.join(" ")}`);
    } else {
      logger.error(`Command failed with code ${code}: ${commandArray.join(" ")}`);
    }
  }

  return code;
}

export async function runShellCommandWithOutput(
  commandArray: Array<string>,
  additionalEnv = {},
  useSpinner = true,
  silent = false,
): Promise<string> {
  const env = {
    ...Deno.env.toObject(),
    ...additionalEnv,
  };
  if (!silent) {
    logger.info(`Running command: ${commandArray.join(" ")}`);
  }
  let stopSpinner;
  if (useSpinner) {
    stopSpinner = startSpinner();
  }
  const cwd = getConfigurationVariable("BF_PATH") ?? Deno.cwd();

  const cmd = new Deno.Command(commandArray[0], {
    args: commandArray.slice(1),
    stdout: "piped",
    stderr: "piped",
    cwd,
    env,
  });

  const process = cmd.spawn();
  runningProcesses.push(process);
  const { stdout } = await process.output();
  if (stopSpinner) {
    stopSpinner();
  }
  return new TextDecoder().decode(stdout);
}

export function registerShellCommand(
  name: string,
  description: string,
  commandArray: Array<string>,
  useSpinner = true,
) {
  const shellCommand = (args: Array<string>) => {
    return runShellCommand(
      [...commandArray, ...args],
      undefined,
      {},
      useSpinner,
    );
  };
  register(
    name,
    description,
    shellCommand,
  );
  return shellCommand;
}
