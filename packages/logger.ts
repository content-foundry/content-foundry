// File: packages/logger.ts
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
    for (const line of stack) {
      if (
        !line.includes("/node_modules/") &&
        !line.includes("loglevel-plugin-prefix.mjs") &&
        !line.includes("getCallerInfo") &&
        !line.includes("Object.nameFormatter")
      ) {
        const match = line.match(/at (.+):(\d+):(\d+)/);
        if (match) {
          return `:${match[2]}`;
        }
      }
    }
  }
  return "unknown:0";
}

function isBrowser() {
  return typeof Deno === "undefined";
}

if (!isBrowser()) {
  const defaultLogLevelString = getConfigurationVariable("LOG_LEVEL") ?? "INFO";
  const defaultLogLevel =
    log.levels[defaultLogLevelString as keyof typeof log.levels];
  log.setDefaultLevel(defaultLogLevel);
  logLevelPrefixPlugin.reg(log);
  logLevelPrefixPlugin.apply(log, {
    template: "%n%l:",
    levelFormatter(level) {
      const LEVEL = level.toUpperCase() as keyof typeof colors;
      return colors[LEVEL](LEVEL);
    },
    nameFormatter(name) {
      const callerInfo = getCallerInfo();
      return `${chalk.dim(`↱ ${name || "global"}${callerInfo}\n`)}`;
    },
  });

  logLevelPrefixPlugin.reg(log);
  logLevelPrefixPlugin.apply(log, {
    template: "%l:",
    levelFormatter(level) {
      return level.toUpperCase();
    },
    nameFormatter(name) {
      if (name === "github_annotations") return "";
      return name ?? "";
    },
    // Use `_timestamp` so that Deno doesn't warn about unused variable
    format(level, name, _timestamp, ...messages) {
      if (name === "github_annotations" && level === "error") {
        const msg = messages.join(" ");
        return `::error::${msg}`;
      }
      return messages.join(" ");
    },
  });
}

const loggerCache = new Map<string, log.Logger>();

export function getLogger(importMeta: ImportMeta | string) {
  let loggerName: string;

  if (typeof importMeta === "string") {
    loggerName = importMeta;
  } else {
    const url = new URL(importMeta.url);
    if (isBrowser()) {
      loggerName = url.pathname;
    } else {
      const relativePathname = url.pathname.split("deno-compile-web/")[1];
      loggerName = relativePathname
        ? relativePathname.replace(/^\//, "")
        : url.pathname;
    }
  }

  if (!loggerCache.has(loggerName)) {
    const newLogger = log.getLogger(loggerName);
    const defaultLogLevelString = getConfigurationVariable("LOG_LEVEL") ??
      "INFO";
    const defaultLogLevel =
      log.levels[defaultLogLevelString as keyof typeof log.levels];
    newLogger.setDefaultLevel(defaultLogLevel);
    loggerCache.set(loggerName, newLogger);
  }
  return loggerCache.get(loggerName)!;
}
