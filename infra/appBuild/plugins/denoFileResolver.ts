import type * as esbuild from "esbuild";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const denoFileResolver: esbuild.Plugin = {
  name: "deno-file-resolver",
  setup(build) {
    build.onResolve(
      { filter: /\.(ts|js|tsx|jsx|md|mdx|ipynb)$/ },
      async (args) => {
        if (args.kind === "entry-point") return;

        const resolved = import.meta.resolve(args.path).split("file://")[1];
        const fileExists = await Deno.lstat(resolved).then(() => true).catch(
          () => false,
        );
        logger.debug(resolved);
        if (fileExists) {
          return { path: resolved };
        }
        return null;
      },
    );
  },
};
