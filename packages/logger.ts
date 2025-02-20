// log stuff and random exports

import log from "loglevel";
import chalk from "chalk";
import logLevelPrefixPlugin from "loglevel-plugin-prefix";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
chalk.level = 3;


log.setDefaultLevel(log.levels.INFO);

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

function getCallerInfo() {
  const error = new Error();
  const stack = error.stack?.split("\n");
  if (stack) {
    // Iterate through the stack to find the first valid call from user code
    for (let i = 0; i < stack.length; i++) {
      const line = stack[i];
      if (
        !line.includes("/node_modules/") && // Skip over node_module calls
        !line.includes("loglevel-plugin-prefix.mjs") && // Skip logging library
        !line.includes("getCallerInfo") && // Ignore utility function
        !line.includes("Object.nameFormatter") // Skip inside logger formatting
      ) {
        const match = line.match(/at (.+):(\d+):(\d+)/);
        if (match) {
          // Return the line number
          return `:${match[2]}`;
        }
      }
    }
  }

  return "unknown:0";
}

if (!isBrowser()) {
  const defaultLogLevelString = getConfigurationVariable("LOG_LEVEL") ?? "INFO";
  const defaultLogLevel =
    log.levels[defaultLogLevelString as keyof typeof log.levels];
  log.setDefaultLevel(defaultLogLevel);
  logLevelPrefixPlugin.reg(log);
  let previousPath = "";
  logLevelPrefixPlugin.apply(log, {
    template: "%n%l:",
    levelFormatter(level) {
      const LEVEL = level.toUpperCase() as keyof typeof colors;
      return colors[LEVEL](LEVEL);
    },
    nameFormatter(name) {
      const callerInfo = getCallerInfo();
      const currentPath = `${name || "global"}${callerInfo}`;
      if (currentPath !== previousPath) {
        previousPath = currentPath;
        return chalk.dim(`↱ ${currentPath}\n`);
      }
      return "";
    },
    timestampFormatter(date) {
      return date.toISOString();
    },
  });

  logLevelPrefixPlugin.reg(log);
  logLevelPrefixPlugin.apply(log, {
    template: "%l:",
    levelFormatter(level) {
      // We only want to do the GitHub annotation format for .error logs
      // from the "github_annotations" logger
      return level.toUpperCase();
    },
    nameFormatter(name) {
      if (name === "github_annotations") {
        // Return an empty prefix so it doesn’t clutter
        return "";
      }
      return name ?? "";
    },
    format(level, name, timestamp, ...messages) {
      if (name === "github_annotations") {
        if (level === "error") {
          // Turn messages into a single string
          const msg = messages.join(" ");
          // Possibly parse out file=..., line=..., etc. if you keep them in the message
          return `::error::${msg}`;
        } else {
          return messages.join(" ");
        }
      }
      // Normal fallback
      return messages.join(" ");
    },
  });
}

export function isBrowser() {
  return typeof Deno === "undefined";
}

// Cache for logger instances
const loggerCache = new Map<string, ReturnType<typeof log.getLogger>>();

export function getLogger(importMeta: ImportMeta | string) {
  let loggerName: string;

  if (typeof importMeta === "string") {
    loggerName = importMeta;
  } else {
    const url = new URL(importMeta.url);
    if (isBrowser()) {
      loggerName = url.pathname;
    } else {
      // get relative url and remove leading slash
      const relativePathname = url.pathname.split("deno-compile-web/")[1];
      loggerName = relativePathname
        ? relativePathname.replace(/^\//, "")
        : url.pathname;
    }
  }

  if (!loggerCache.has(loggerName)) {
    const logger = log.getLogger(loggerName);
    const defaultLogLevelString = getConfigurationVariable("LOG_LEVEL") ??
      "INFO";
    const defaultLogLevel =
      log.levels[defaultLogLevelString as keyof typeof log.levels];
    logger.setDefaultLevel(defaultLogLevel);
    loggerCache.set(loggerName, logger);
  }

  return loggerCache.get(loggerName)!;
}
