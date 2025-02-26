import {
  type FeatureFlagsEnabled,
  featureFlagsEnabled,
} from "packages/featureFlags/featureFlagsList.ts";
import { useAppEnvironment } from "packages/app/contexts/AppEnvironmentContext.tsx";

export function useFeatureFlagEnabled(
  flag: keyof FeatureFlagsEnabled,
): boolean {
  const { featureFlags } = useAppEnvironment();
  let flagEnabled = featureFlagsEnabled[flag];
  if (featureFlags && featureFlags[flag] != undefined) {
    flagEnabled = Boolean(featureFlags[flag]);
  }
  return flagEnabled;
}

export function useFeatureTier(
  tier: "starter" | "basic" | "pro",
): boolean {
  const flag = `gating_${tier}` as keyof FeatureFlagsEnabled;
  return useFeatureFlagEnabled(flag);
}
