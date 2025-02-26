import {
  type FeatureFlagsEnabled,
  featureFlagsEnabled,
  type FeatureFlagsVariant,
  featureFlagsVariant,
} from "packages/featureFlags/featureFlagsList.ts";

import { getCurrentClients } from "lib/posthog.ts";

/**
 * Return the boolean value of a feature flag from PostHog if possible;
 * otherwise fallback to local definitions in featureFlagsEnabled.
 *
 * @param flag Name of the feature flag
 * @param personBfGraphId If set, can be used to identify the user on the server side
 * @returns boolean (on/off)
 */
export async function getFeatureFlagEnabled(
  flag: keyof FeatureFlagsEnabled,
  personBfGraphId?: string,
): Promise<boolean> {
  // Attempt to set up PostHog
  const { frontendClient, backendClient } = await getCurrentClients();

  // If we have a client on the front-end (client-side), use it
  if (frontendClient) {
    // posthog.getFeatureFlag() returns `boolean | string | undefined`; cast as needed
    return Boolean(frontendClient.getFeatureFlag(flag));
  }

  // If we have a client on the back-end and an ID, use it
  if (backendClient && personBfGraphId) {
    // node-posthog's getFeatureFlag can also return a boolean or a variant string
    const val = await backendClient.getFeatureFlag(flag, personBfGraphId);
    return Boolean(val);
  }

  // Otherwise fallback to local definitions
  return featureFlagsEnabled[flag];
}

/**
 * Return the variant (string or structured data) from PostHog if possible;
 * otherwise fallback to local definitions in featureFlagsVariant.
 *
 * @param variant Name of the variant
 * @param personBfGraphId If set, can be used to identify the user on the server side
 * @returns The variant data if available, else the local default
 */
export function getFeatureFlagVariant<T extends keyof FeatureFlagsVariant>(
  variant: T,
  personBfGraphId?: string,
): FeatureFlagsVariant[T] | Promise<FeatureFlagsVariant[T]> {
  const { frontendClient, backendClient } = getCurrentClients();

  // If we have a client on the front-end (client-side)
  if (frontendClient) {
    // If the feature is toggled on, getFeatureFlagPayload might have a variant
    const isOn = frontendClient.getFeatureFlag(variant);
    if (isOn) {
      const payload = frontendClient.getFeatureFlagPayload(variant);
      if (payload) {
        return payload as FeatureFlagsVariant[T];
      }
    }
  }

  // If we have a node-posthog client on the back-end
  if (backendClient && personBfGraphId) {
    // We'll fetch the boolean first to see if it's on
    // and then fetch the payload if on
    const flagPromise = backendClient.getFeatureFlag(variant, personBfGraphId);
    const payloadPromise = backendClient.getFeatureFlagPayload(
      variant,
      personBfGraphId,
    );
    return Promise.all([flagPromise, payloadPromise]).then(
      ([flagValue, flagPayload]) => {
        if (!flagValue) {
          // The variant is not turned on, so fallback
          return featureFlagsVariant[variant];
        }
        if (flagPayload) {
          return flagPayload as FeatureFlagsVariant[T];
        }
        return featureFlagsVariant[variant];
      },
    );
  }

  // Otherwise fallback if offline or no user
  return featureFlagsVariant[variant];
}
