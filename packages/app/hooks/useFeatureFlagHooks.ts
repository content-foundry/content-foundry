import {
  type FeatureFlagsEnabled,
  featureFlagsEnabled,
  type FeatureFlagsVariant,
  featureFlagsVariant,
} from "packages/featureFlags/featureFlagsList.ts";

export function useFeatureFlagVariant<T extends keyof FeatureFlagsVariant>(
  variant: T,
): FeatureFlagsVariant[T] {
  // const { featureFlags } = useAppEnvironment();
  // return featureFlags[variant];
  return featureFlagsVariant[variant];
}

export function useFeatureFlagEnabled(
  flag: keyof FeatureFlagsEnabled,
): boolean {
  // const { featureFlags } = useAppEnvironment();
  return featureFlagsEnabled[flag];
}

export function useFeatureTier(
  tier: "starter" | "basic" | "pro",
): boolean {
  const flag = `gating_${tier}` as keyof FeatureFlagsEnabled;
  return useFeatureFlagEnabled(flag);
}
