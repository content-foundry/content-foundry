import type * as esbuild from "esbuild";
import { compile } from "@mdx-js/mdx";
import { getLogger } from "packages/logger.ts";
import { processNotebookContent } from "infra/appBuild/utils/notebookUtils.ts";

const logger = getLogger(import.meta);

export const ipynbPlugin: esbuild.Plugin = {
  name: "ipynb-to-mdx",
  setup(build) {
    build.onLoad({ filter: /\.ipynb/ }, async (args) => {
      const raw = await Deno.readTextFile(
        new URL(import.meta.resolve(args.path)),
      );

      const mdxSource = processNotebookContent(raw);
      const mdxOutput = await compile(mdxSource);
      const contents = String(mdxOutput);
      logger.debug("mdxOutput\n", contents);
      return {
        contents,
        loader: "js",
      };
    });
  },
};
