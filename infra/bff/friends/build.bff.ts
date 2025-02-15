import { runShellCommand } from "infra/bff/shellBase.ts";
import { register } from "infra/bff/bff.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

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
  "WS_NO_BUFFER_UTIL",
];

const DATABASE_STRING = getConfigurationVariable("DATABASE_URL") ?? "";
const DATABASE_URL = new URL(DATABASE_STRING);
const dbDomain = DATABASE_URL.hostname;
const neonApiParts = dbDomain.split(".");
neonApiParts[0] = "api";
const neonApiDomain = neonApiParts.join(".");

const allowedNetworkDestionations = [
  "api.assemblyai.com:443",
  "0.0.0.0",
  "127.0.0.1",
  "localhost",
  "openrouter.ai",
  dbDomain,
  neonApiDomain,
];

const includableRemotes = [
  "localhost:9444",
  "jsr.io",
];

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
  `--allow-import=${includableRemotes.join(",")}`,
  "packages/web/web.tsx",
];

export async function build(): Promise<number> {
  await Deno.remove("build", { recursive: true });
  await Deno.mkdir("build", { recursive: true });
  await Deno.writeFile("build/.gitkeep", new Uint8Array());
  await Deno.remove("static/build", { recursive: true });
  await Deno.mkdir("static/build", { recursive: true });
  await Deno.writeFile("static/build/.gitkeep", new Uint8Array());
  const contentResult = await runShellCommand([
    "./infra/appBuild/contentBuild.ts",
  ]);
  if (contentResult !== 0) {
    return contentResult;
  }
  const result = await runShellCommand(["./packages/graphql/graphqlServer.ts"]);
  if (result) return result;
  const isographResult = await runShellCommand(
    ["deno", "run", "-A", "npm:@isograph/compiler"],
    "packages/app",
  );
  if (isographResult) return result;
  const denoCompile = runShellCommand(denoCompilationCommand);
  const jsCompile = runShellCommand(["./infra/appBuild/appBuild.ts"]);
  const [denoResult, jsResult] = await Promise.all([denoCompile, jsCompile]);

  return denoResult || jsResult;
}

register("build", "Builds the current project", build);
