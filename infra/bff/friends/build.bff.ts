// Modified version of infra/bff/friends/build.bff.ts

import { runShellCommand } from "infra/bff/shellBase.ts";
import { register } from "infra/bff/bff.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

const allowedEnvironmentVariables = [
  "ASSEMBLY_AI_KEY",
  "BF_ENV",
  "CI",
  "COLORTERM",
  "DATABASE_URL",
  "DEBUG",
  "DENO_TRACE_PERMISSIONS",
  "FORCE_COLOR",
  "LOG_LEVEL",
  "NODE_ENV",
  "NODE_PG_FORCE_NATIVE",
  "OPENAI_BASE_URL",
  "OPENAI_API_KEY",
  "OPENAI_ORG_ID",
  "OPENAI_PROJECT_ID",
  "OPEN_ROUTER_API_KEY",
  "POSTHOG_API_KEY",
  "REPL_HOME",
  "REPLIT_DEV_DOMAIN",
  "RPID",
  "TEAMCITY_VERSION",
  "TERM",
  "TF_BUILD",
  "USER",
  "WEB_PORT",
  "WS_NO_BUFFER_UTIL",
];

// This part is modified to avoid direct dependency on DATABASE_URL
const DATABASE_STRING = getConfigurationVariable("DATABASE_URL") ?? "";
// Define default network destinations if DATABASE_URL isn't set
const DEFAULT_NETWORK_DESTINATIONS = [
  "0.0.0.0",
  "127.0.0.1",
  "api.assemblyai.com",
  "esm.sh:443",
  "localhost",
  "openrouter.ai",
  "api.openai.com:443",
];

const allowedNetworkDestionations = [...DEFAULT_NETWORK_DESTINATIONS];

// Only attempt to parse DATABASE_URL if it exists
if (DATABASE_STRING) {
  try {
    const DATABASE_URL = new URL(DATABASE_STRING);
    const dbDomain = DATABASE_URL.hostname;
    const neonApiParts = dbDomain.split(".");
    neonApiParts[0] = "api";
    const neonApiDomain = neonApiParts.join(".");

    // Add database domains to allowed destinations
    allowedNetworkDestionations.push(dbDomain, neonApiDomain);
  } catch (err) {
    logger.warn(
      "Could not parse DATABASE_URL, continuing with default network destinations",
      err,
    );
  }
}

const includableDirectories = [
  "packages",
  "content",
  "build/content",
  "static",
];

const readableLocations = [
  "$HOME/workspace",
  "./",
];

const allowedBinaries = [
  "sl",
];

const denoCompilationCommand = [
  "deno",
  "compile",
  "--output=build/",
  ...includableDirectories.map((dir) => `--include=${dir}`),
  `--allow-net=${allowedNetworkDestionations.join(",")}`,
  `--allow-env=${allowedEnvironmentVariables.join(",")}`,
  `--allow-read=${readableLocations.join(",")}`,
  `--allow-run=${allowedBinaries.join(",")}`,
  "packages/web/web.tsx",
];

export async function build([waitForFail]: Array<string>): Promise<number> {
  await Deno.remove("build", { recursive: true }).catch(() => {
    // Ignore errors if directory doesn't exist
  });
  await Deno.mkdir("build", { recursive: true });
  await Deno.writeFile("build/.gitkeep", new Uint8Array());

  await Deno.remove("static/build", { recursive: true }).catch(() => {
    // Ignore errors if directory doesn't exist
  });
  await Deno.mkdir("static/build", { recursive: true });
  await Deno.writeFile("static/build/.gitkeep", new Uint8Array());

  const routesBuildResult = await runShellCommand([
    "./infra/appBuild/routesBuild.ts",
  ]);
  if (routesBuildResult !== 0) {
    return routesBuildResult;
  }

  const contentResult = await runShellCommand([
    "./infra/appBuild/contentBuild.ts",
  ]);
  if (contentResult !== 0) {
    return contentResult;
  }

  const result = await runShellCommand(["./packages/graphql/graphqlServer.ts"]);
  if (result) return result;
  if (result && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 15000);
    });
  }

  const isographResult = await runShellCommand(
    ["deno", "run", "-A", "npm:@isograph/compiler"],
    "packages/app",
  );

  if (isographResult && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 15000);
    });
  }

  const denoCompile = runShellCommand(denoCompilationCommand);
  const jsCompile = runShellCommand(["./infra/appBuild/appBuild.ts"]);
  const [denoResult, jsResult] = await Promise.all([denoCompile, jsCompile]);
  if ((denoResult || jsResult) && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 10000);
    });
  }

  return denoResult || jsResult;
}

register("build", "Builds the current project", build);
