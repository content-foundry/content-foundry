import type * as esbuild from "esbuild";
import { dirname, fromFileUrl, join } from "@std/path";

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
