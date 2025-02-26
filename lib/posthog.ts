// lib/posthog.ts

import { getLogger } from "packages/logger.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import type { PostHog as PostHogJs } from "posthog-js";
import type { PostHog as PostHogNode } from "posthog-node";

const logger = getLogger(import.meta);

// Track our client instances
let frontendClient: PostHogJs | null = null;
let backendClient: PostHogNode | null = null;

/**
 * Returns current PostHog clients without initializing them if they don't exist
 */
export function getCurrentClients() {
  return { frontendClient, backendClient };
}

/**
 * Initialize and get the appropriate PostHog client
 * @param distinctId Optional distinct ID for the user
 * @returns The initialized PostHog clients
 */
export async function getPosthogClient(
  distinctID?: string,
  featureFlags?: Record<string, string | boolean>,
) {
  // Return existing clients if already initialized
  if (frontendClient || backendClient) {
    return { frontendClient, backendClient };
  }

  const POSTHOG_API_KEY = getConfigurationVariable("POSTHOG_API_KEY");
  const POSTHOG_HOST = getConfigurationVariable("POSTHOG_HOST") ??
    "https://app.posthog.com";

  if (!POSTHOG_API_KEY) {
    logger.warn("No API key found for PostHog");
    return {};
  }

  // Browser environment - initialize frontend client
  if (typeof Deno === "undefined") {
    try {
      const { posthog } = await import("posthog-js");
      posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_HOST,
        bootstrap: {
          distinctID,
          featureFlags,
        },
      });
      frontendClient = posthog;
      logger.debug("PostHog frontend client initialized");
      return { frontendClient };
    } catch (error) {
      logger.error("Failed to initialize PostHog frontend client", error);
      return {};
    }
  } // Server environment - initialize backend client
  else {
    try {
      const { PostHog } = await import("posthog-node");
      backendClient = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
        fetch,
      });
      logger.debug("PostHog backend client initialized");
      return { backendClient };
    } catch (error) {
      logger.error("Failed to initialize PostHog backend client", error);
      return {};
    }
  }
}

/**
 * Get a feature flag value from PostHog
 */
export async function getFeatureFlag(
  flag: string,
  personId?: string,
): Promise<boolean> {
  const { frontendClient, backendClient } = await getPosthogClient();

  if (frontendClient) {
    return Boolean(frontendClient.getFeatureFlag(flag) || false);
  }

  if (backendClient && personId) {
    return Boolean(await backendClient.getFeatureFlag(flag, personId) || false);
  }

  // Default fallback
  return false;
}

/**
 * Get a feature flag variant from PostHog
 */
export async function getFeatureVariant<T>(
  variant: string,
  personId?: string,
): Promise<T | null> {
  const { frontendClient, backendClient } = await getPosthogClient();

  if (frontendClient) {
    const isEnabled = frontendClient.getFeatureFlag(variant);
    if (isEnabled) {
      return frontendClient.getFeatureFlagPayload(variant) as T;
    }
  }

  if (backendClient && personId) {
    const isEnabled = await backendClient.getFeatureFlag(variant, personId);
    if (isEnabled) {
      return await backendClient.getFeatureFlagPayload(variant, personId) as T;
    }
  }

  return null;
}

/**
 * Shutdown the PostHog backend client
 */
export async function shutdownPosthog() {
  if (backendClient) {
    await backendClient.shutdown();
    backendClient = null;
    logger.debug("PostHog backend client shutdown");
  }
}
