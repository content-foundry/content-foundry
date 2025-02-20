#! /usr/bin/env -S deno run -A

import { friendMap } from "infra/bff/bff.ts";
import { getLogger } from "packages/logger.ts";
import { dirname, join } from "@std/path";

// This little helper finds the top-level directory by searching for `.git`
async function findProjectRoot(): Promise<string> {
  let current = Deno.cwd();

  while (true) {
    try {
      const gitDir = join(current, ".git");
      const stat = await Deno.stat(gitDir);
      if (stat.isDirectory) {
        // Found a .git directory => that's our root
        return current;
      }
    } catch (_err) {
      // If .git not found or no permission, we just keep going
    }
    const parent = dirname(current);
    if (parent === current) {
      // Reached the system root without finding .git
      break;
    }
    current = parent;
  }

  // fallback: whatever directory bff was invoked from
  return Deno.cwd();
}

const logger = getLogger(import.meta);

if (import.meta.main) {
  // 1) Force us to run from top-level directory
  const rootDir = await findProjectRoot();
  if (rootDir !== Deno.cwd()) {
    logger.info(`Switching working directory to: ${rootDir}`);
    Deno.chdir(rootDir);
  }

  // 2) Then load environment files, scan “friends”, etc.

  const friendsUrl = new URL(import.meta.resolve("infra/bff/friends"));
  const envFiles = [".env", ".env.awscreds", ".env.lambdas"];
  for (const envFile of envFiles) {
    const envUrl = new URL(envFile, `file://${Deno.cwd()}/`);
    try {
      const env = await Deno.readTextFile(envUrl);
      for (const line of env.split("\n")) {
        const [key, value] = line.split("=");
        if (key && value) Deno.env.set(key, value);
      }
    } catch (error) {
      // ...
    }
  }

  for await (const friend of Deno.readDir(friendsUrl.pathname)) {
    if (friend.name.endsWith(".bff.ts")) {
      try {
        await import(`infra/bff/friends/${friend.name}`);
      } catch (e) {
        logger.error(`Error importing ${friend.name}`, e);
      }
    }
  }

  const command = Deno.args[0] ?? "help";
  const friend = friendMap.get(command);

  if (friend) {
    Deno.exit(await friend.command(Deno.args.slice(1)));
  } else {
    // ...
  }
}