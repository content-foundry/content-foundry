import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Cache instance for reuse
let cachedBackend: DatabaseBackend | null = null;
let backendPromise: Promise<DatabaseBackend> | null = null;

export async function getBackend(): Promise<DatabaseBackend> {
  if (cachedBackend) {
    return cachedBackend;
  }

  if (backendPromise) {
    return await backendPromise;
  }

  backendPromise = (async () => {
    const backendType = getConfigurationVariable("DATABASE_BACKEND") ?? "neon";

    logger.debug(`Creating database backend of type: ${backendType}`);

    switch (backendType.toLowerCase()) {
      case "neon": {
        const { DatabaseBackendNeon } = await import(
          "packages/bfDb/backend/DatabaseBackendNeon.ts"
        );
        cachedBackend = new DatabaseBackendNeon();
        break;
      }

      default:
        throw new Error(`Unknown database backend type: ${backendType}`);
    }

    return cachedBackend;
  })();

  return await backendPromise;
}

/**
 * Close the current database backend connection
 * This is important for tests to prevent connection leaks
 */
export async function closeBackend(): Promise<void> {
  if (cachedBackend) {
    logger.debug("Closing database backend connection");
    await cachedBackend.close();
    cachedBackend = null;
    backendPromise = null;
  }
}
