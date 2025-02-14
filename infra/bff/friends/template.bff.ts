// ./infra/bff/friends/template.bff.ts
import { register } from "infra/bff/bff.ts";
import { getLogger } from "packages/logger.ts";
import * as path from "@std/path";

const logger = getLogger(import.meta);

/**
 * Looks in `startDir` for a file named `__TEMPLATE__{extension}`, and if not found,
 * keeps moving one directory up until it either finds the file or reaches the top of
 * the drive.
 */
async function findTemplateFile(
  startDir: string,
  extension: string,
): Promise<string | null> {
  let currentDir = path.resolve(startDir);

  while (true) {
    const candidate = path.join(currentDir, `__TEMPLATE__${extension}`);
    try {
      await Deno.stat(candidate);
      return candidate;
    } catch {
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break; // Root reached
      currentDir = parent;
    }
  }
  return null;
}

// 1) Export the command's main logic so tests can import it.
export async function templateCommand(args: string[]): Promise<number> {
  if (args.length < 1) {
    logger.error("Usage: bff template <filename>");
    return 1;
  }

  const filename = args[0];
  const extension = path.extname(filename);
  const cwd = Deno.cwd();

  // Search upward for __TEMPLATE__{extension}
  const templatePath = await findTemplateFile(cwd, extension);
  let templateContent = "";

  if (templatePath) {
    templateContent = await Deno.readTextFile(templatePath);
    logger.info(`Using template from: ${templatePath}`);
  } else {
    const localTemplate = path.join(cwd, `__TEMPLATE__${extension}`);
    // Create an empty template if none is found
    await Deno.writeTextFile(localTemplate, "");
    logger.info(
      `No template found. Created empty template at: ${localTemplate}`,
    );
  }

  // Write out the new file from (possibly empty) templateContent
  const newFilePath = path.join(cwd, filename);
  await Deno.writeTextFile(newFilePath, templateContent);

  logger.info(
    `Created ${filename} ${
      templatePath ? "from a found template" : "(blank)"
    }!`,
  );
  return 0;
}

// 2) Register the same function with BFF
register(
  "template",
  "Create a new file from a template, searching up the directory tree for __TEMPLATE__",
  templateCommand,
);
