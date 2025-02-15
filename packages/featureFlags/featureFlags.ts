import {
  type FeatureFlagsEnabled,
  featureFlagsEnabled,
  type FeatureFlagsVariant,
  featureFlagsVariant,
} from "packages/featureFlags/featureFlagsList.ts";

import {
  ensurePosthogClientIsSetUp,
  getCurrentClients,
} from "packages/analytics/analytics.ts";

export async function getFeatureFlagEnabled(
  flag: keyof FeatureFlagsEnabled,
  personBfGraphId?: string | undefined,
): Promise<boolean> {
  const { frontendClient, backendClient } = await ensurePosthogClientIsSetUp();
  if (frontendClient) {
    return frontendClient.getFeatureFlag(flag) as boolean;
  }
  if (backendClient && personBfGraphId) {
    return await backendClient.getFeatureFlag(
      flag,
      personBfGraphId,
    ) as boolean;
  }
  return featureFlagsEnabled[flag];
}

export function getFeatureFlagVariant<T extends keyof FeatureFlagsVariant>(
  variant: T,
  personBfGraphId?: string | undefined,
): FeatureFlagsVariant[T] | Promise<FeatureFlagsVariant[T]> {
  const { frontendClient, backendClient } = getCurrentClients();

  if (frontendClient) {
    const key = frontendClient.getFeatureFlag(variant);
    if (key) {
      return frontendClient.getFeatureFlagPayload(
        variant,
      ) as FeatureFlagsVariant[T];
    }
  }

  if (backendClient && personBfGraphId) {
    const flagPromise = backendClient.getFeatureFlag(variant, personBfGraphId);
    const payloadPromise = backendClient.getFeatureFlagPayload(
      variant,
      personBfGraphId,
    );
    return Promise.all([
      flagPromise,
      payloadPromise,
    ]).then(([flagValue, flagPayload]) => {
      if (!flagValue) {
        return featureFlagsVariant[variant];
      }
      return flagPayload as FeatureFlagsVariant[T];
    });
  }

  return featureFlagsVariant[variant];
}
