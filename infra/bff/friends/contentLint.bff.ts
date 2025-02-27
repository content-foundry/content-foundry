import { register } from "infra/bff/bff.ts";
import { getLogger } from "packages/logger.ts";
import { extractYaml } from "@std/front-matter";
import { walk } from "@std/fs";
import { join } from "@std/path";
import type { JSONValue } from "packages/bfDb/bfDb.ts";

const logger = getLogger(import.meta);

const REQUIRED_FIELDS = ["title", "author", "summary", "cta"];

export async function contentLint(
  args: string[],
  contentDir = "content/blog",
): Promise<number> {
  const shouldFix = args.includes("--fix");
  logger.info(
    `Starting content linting... ${shouldFix ? "(with auto-fix)" : ""}`,
  );
  let hasErrors = false;

  try {
    for await (
      const entry of walk(contentDir, {
        exts: [".md", ".mdx"],
        includeDirs: false,
      })
    ) {
      logger.info(`Checking ${entry.path}...`);

      const filePath = join(Deno.cwd(), entry.path);
      let content = await Deno.readTextFile(filePath);

      if (!content.trim().startsWith("---")) {
        if (shouldFix) {
          // Add default frontmatter to the beginning of the file
          content =
            `---\ntitle: "Untitled"\nauthor: "Unknown"\nsummary: "No summary provided"\ncta: "Read more"\n---\n\n${content}`;
          await Deno.writeTextFile(filePath, content);
          logger.info(`✅ ${entry.path}: Added missing front matter`);
          continue;
        }
        logger.error(`❌ ${entry.path}: No front matter found`);
        hasErrors = true;
        continue;
      }

      // Check if frontmatter is properly closed (has second ---)
      const frontmatterMatches = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatches && content.startsWith("---")) {
        if (shouldFix) {
          // Try to fix malformed frontmatter - add closing delimiter
          const updatedContent = content.replace(
            /^---([\s\S]*?)(\n\n|\n)/,
            "---$1\n---\n\n",
          );
          await Deno.writeTextFile(filePath, updatedContent);
          logger.info(`✅ ${entry.path}: Fixed malformed front matter`);
          content = updatedContent;
        } else {
          logger.error(
            `❌ ${entry.path}: Malformed front matter (missing closing delimiter)`,
          );
          hasErrors = true;
          continue;
        }
      }

      const { attrs, body } = extractYaml(content);
      let needsUpdate = false;
      const updatedAttrs = { ...attrs as Record<string, JSONValue> };

      // Check required fields
      for (const field of REQUIRED_FIELDS) {
        if (!(attrs as Record<string, JSONValue>)[field]) {
          hasErrors = true;
          if (shouldFix) {
            needsUpdate = true;
            updatedAttrs[field] = field === "title"
              ? "Untitled"
              : field === "author"
              ? "Unknown"
              : field === "summary"
              ? "No summary provided"
              : "Read more";
            logger.info(`✅ ${entry.path}: Added missing ${field}`);
          } else {
            logger.error(`❌ ${entry.path}: Missing required field '${field}'`);
          }
        }
      }

      if (needsUpdate && shouldFix) {
        const updatedContent = `---\n${
          Object.entries(updatedAttrs)
            .map(([key, value]) => `${key}: "${value}"`)
            .join("\n")
        }\n---\n${body}`;
        await Deno.writeTextFile(filePath, updatedContent);
      }

      if (!hasErrors) {
        logger.info(`✅ ${entry.path}: All checks passed`);
      }
    }
  } catch (error) {
    logger.error("Error during content linting:", error);
    return 1;
  }

  if (hasErrors && !shouldFix) {
    logger.error("Content linting failed - see errors above");
    return 1;
  }

  logger.info(
    `Content linting completed ${
      shouldFix ? "and fixes applied " : ""
    }successfully`,
  );
  return 0;
}

register(
  "contentLint",
  "Lint markdown content files for required front matter",
  contentLint,
);
