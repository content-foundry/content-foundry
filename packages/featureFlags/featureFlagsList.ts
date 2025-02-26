/**
 * This file is used to define local fallback for features and their variants.
 * PostHog is used as the source of truth if available, but if offline or uninitialized,
 * these default definitions apply. Keep everything alphabetized, and if you add a
 * new feature-flag, add it to both the `featureFlagsEnabledUnfrozen` or
 * `featureFlagsVariantUnfrozen` (depending on boolean vs. variant).
 */

//
// 1) Type definitions
//
export type FeatureFlagsEnabled = typeof featureFlagsEnabled;
export type FeatureFlagsVariant = typeof featureFlagsVariant;

export type FeatureFlagVariant<T extends keyof FeatureFlagsVariant> =
  FeatureFlagsVariant[T];
export type FeatureFlagEnabled<T extends keyof FeatureFlagsEnabled> =
  FeatureFlagsEnabled[T];

//
// 2) Default variants (multi-valued flags)
//
const featureFlagsVariantUnfrozen = {
  // For example, if you want to store text or multiple states
  // "example_variant_flag": {
  //   "experimentGroupA": "someValue",
  //   "experimentGroupB": "otherValue"
  // }
};

export const featureFlagsVariant = Object.freeze(featureFlagsVariantUnfrozen);

//
// 3) Default booleans
//
// "Gating" flags are how we separate subscription tiers, e.g. gating_starter, gating_basic, gating_pro
// so that we can use them with posthog user properties.
const gatingFlags = {
  gating_starter: false,
  gating_basic: false,
  gating_pro: false,
};

const featureFlagsEnabledUnfrozen = {
  // Example boolean flags, keep alphabetical:
  enable_demo_button: true,
  enable_login_form: true,
  enable_sidebar: false,
  show_extended_content: false,

  ...gatingFlags,
};

export const featureFlagsEnabled = Object.freeze(featureFlagsEnabledUnfrozen);
