import { DatabaseBackendNeon } from "packages/bfDb/backend/DatabaseBackendNeon.ts";
import type { DatabaseBackend } from "packages/bfDb/backend/DatabaseBackend.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Singleton instance of the database backend
let _backend: DatabaseBackend | null = null;

/**
 * Get the database backend instance
 * This function creates a singleton instance of the database backend
 */
export function getBackend(): DatabaseBackend {
  if (_backend === null) {
    logger.info("Creating new DatabaseBackendNeon instance");
    _backend = new DatabaseBackendNeon();
  }
  return _backend;
}
