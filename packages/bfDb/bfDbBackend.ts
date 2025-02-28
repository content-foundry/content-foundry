import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { DatabaseBackendNeon } from "packages/bfDb/backend/DatabaseBackendNeon.ts";
import { DatabaseBackendPg } from "packages/bfDb/backend/DatabaseBackendPg.ts";

const logger = getLogger(import.meta);

let backend: DatabaseBackend | null = null;

/**
 * Gets the appropriate database backend based on environment configuration.
 * This allows switching between different database backends without changing application code.
 */
export function getBackend(): DatabaseBackend {
  if (backend !== null) {
    return backend;
  }

  const backendType = getConfigurationVariable("DB_BACKEND_TYPE") || "neon";

  logger.info(`Initializing database backend: ${backendType}`);

  switch (backendType.toLowerCase()) {
    case "pg":
      logger.info("Using direct PostgreSQL backend with pg package");
      backend = new DatabaseBackendPg();
      break;
    case "neon":
    default:
      logger.info("Using Neon PostgreSQL backend");
      backend = new DatabaseBackendNeon();
      break;
  }

  return backend;
}
