import { extractYaml } from "@std/front-matter";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

/**
 * Safely extracts YAML frontmatter from a content string
 * Falls back gracefully if frontmatter is missing or malformed
 */
export function safeExtractFrontmatter<T>(
  content: string,
  defaultValues: Partial<T> = {},
): { attrs: Partial<T>; body: string } {
  // Default return structure
  const result = {
    attrs: { ...defaultValues } as Partial<T>,
    body: content,
  };

  // No content or doesn't start with frontmatter delimiter
  if (!content || !content.trim().startsWith("---")) {
    logger.info("Content has no frontmatter, using defaults");
    return result;
  }

  try {
    const extracted = extractYaml<Partial<T>>(content);
    return {
      attrs: { ...defaultValues, ...extracted.attrs },
      body: extracted.body || "",
    };
  } catch (err) {
    logger.warn("Failed to parse frontmatter, using defaults:", err);

    // Try to extract the body at least (everything after the second ---)
    const bodyMatch = content.match(/---\s*[\s\S]*?---\s*([\s\S]*)/);
    if (bodyMatch && bodyMatch[1]) {
      result.body = bodyMatch[1];
    }

    return result;
  }
}
