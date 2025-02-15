#!/usr/bin/env -S deno run -A

import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
// Use Deno standard library path functions:
import { dirname, fromFileUrl, join } from "@std/path";

const logger = getLogger(import.meta);

// ──────────────────────────────────────────────────────────────────────────────
// 2. Deno file resolver plugin (for .ts/.js) unchanged
// ──────────────────────────────────────────────────────────────────────────────
const denoFileResolver: esbuild.Plugin = {
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

// ──────────────────────────────────────────────────────────────────────────────
// MDX plugin from npm:@mdx-js/esbuild
// ──────────────────────────────────────────────────────────────────────────────
import mdx from "@mdx-js/esbuild";
import { compile } from "@mdx-js/mdx";

// ──────────────────────────────────────────────────────────────────────────────
// Content path rewriter (images) plugin. Optional if you're using "loader: file"
// ──────────────────────────────────────────────────────────────────────────────
export const contentPathRewriter: esbuild.Plugin = {
  name: "content-path-rewriter",
  setup(build) {
    build.onResolve({ filter: /\.(png|jpe?g|svg|gif)$/ }, (args) => {
      // If it's relative (starts with "./" or "../"), we transform it
      if (args.path.startsWith(".")) {
        let importerPath = args.importer;
        if (importerPath.startsWith("file://")) {
          importerPath = fromFileUrl(importerPath);
        }
        const importerDir = dirname(importerPath);
        const absolutePath = join(importerDir, args.path);
        return {
          path: absolutePath,
          loader: "file",
        };
      }
      return null;
    });
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// IPYNB plugin to convert notebooks → single MDX string
// Return loader: "mdx" so that @mdx-js/esbuild can parse it properly
// ──────────────────────────────────────────────────────────────────────────────
const ipynbPlugin: esbuild.Plugin = {
  name: "ipynb-to-mdx",
  setup(build) {
    build.onResolve({ filter: /\.ipynb$/ }, (args) => {
      return {
        path: args.path,
        namespace: "ipynb",
      };
    });
    build.onLoad({ filter: /\.ipynb/, namespace: "ipynb" }, async (args) => {
      const raw = await Deno.readTextFile(
        new URL(import.meta.resolve(args.path)),
      );
      const { cells } = JSON.parse(raw);

      // #techdebt
      // deno-lint-ignore no-explicit-any
      const mdxSource = cells.map((cell: any) => {
        if (cell.cell_type === "markdown") {
          return cell.source.join("");
        } else if (cell.cell_type === "code") {
          // Language detection
          const lang = cell.metadata?.language_info?.name ?? "typescript";
          const codeBlock = "```" + lang + "\n" +
            cell.source.join("") + "\n```\n";

          let outputs = "";
          if (cell.outputs) {
            for (const out of cell.outputs) {
              outputs += out.output_type + "\n";
              if (out.output_type === "stream") {
                outputs += "```\n" + out.text.join("") + "\n```\n";
                //     } else if (
                //       ["display_data", "execute_result"].includes(out.output_type)
                //     ) {
                //       outputs += JSON.stringify(out.data, null, 2) + "\n";
                //     } else if (out.output_type === "error") {
                //       outputs += "```error\n" + out.evalue + "\n```\n";
              }
            }
          }
          return codeBlock + "\n---\n" + outputs;
        }
        return "";
      }).join("\n\n");
      const mdxOutput = await compile(mdxSource);
      const contents = String(mdxOutput);
      logger.debug("mdxOutput\n", contents);
      return {
        contents,
        loader: "js",
      };
    });

    // const destinationPath = import.meta.resolve(`build/${args.path}.mdx`)
    //   .replace("file://", "");
    // const destinationDirectory = dirname(destinationPath);
    // await Deno.mkdir(destinationDirectory, { recursive: true });
    // await Deno.writeTextFile(destinationPath, mdxSource);
    // return {
    //   path: destinationPath,
    // };
    // });

    // build.onLoad({ filter: /\.mdx$/ }, async (args) => {
    //   const source = await Deno.readTextFile(args.path);
    //   const updatedSource = source.replace(
    //     /import\s+(\w+)\s+from\s+["']content\/(\w+)\.ipynb["']/g,
    //     'import $1 from "build/content/$2.ipynb.mdx"',
    //   )
    //   const contents = updatedSource
    //   return {
    //     contents,
    //     loader: "jsx",
    //   };
    // });

    // build.onLoad(
    //   { filter: /\.ipynb$/, namespace: "ipynb-as-mdx" },
    //   async (args) => {

    //     return {
    //       contents: String(compiled),
    //       loader: "jsx",
    //     };
    //   },
    // );
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// ESBuild Options
// ──────────────────────────────────────────────────────────────────────────────
const defaultOptions: esbuild.BuildOptions = {
  outdir: "static/build",
  bundle: true,
  splitting: true,
  format: "esm",
  jsx: "automatic",
  minify: getConfigurationVariable("BF_ENV") === "PRODUCTION",
  sourcemap: "inline",
  sourceRoot: getConfigurationVariable("BF_PATH"),
  write: true,

  // So that file-loader references become "/static/build/assets/..."
  publicPath: "/static/build",
  assetNames: "assets/[name]-[hash]",
  plugins: [
    ipynbPlugin,
    mdx(),
    contentPathRewriter,
    denoFileResolver,
    ...denoPlugins(),
  ],
  treeShaking: true,

  entryPoints: [
    "packages/app/ClientRoot.tsx",
    "content/**/*.md",
    "content/**/*.mdx",
    // "content/**/*.ipynb",
  ],
};

export async function build(
  buildOptions: esbuild.BuildOptions = defaultOptions,
) {
  logger.info("Building...");

  const result = await esbuild.build({
    ...defaultOptions,
    ...buildOptions,
  });

  esbuild.stop();
  logger.info("Building complete!!!");
  return result;
}

// If run as script
if (import.meta.main) {
  try {
    await Deno.mkdir("build", { recursive: true });
  } catch (e) {
    if (e.name !== "AlreadyExists") {
      throw e;
    }
  }
  try {
    await build();
  } catch (e) {
    // logger.warn(Biscuts... Failed initial build: ${e.message});
    throw e;
  }
}
