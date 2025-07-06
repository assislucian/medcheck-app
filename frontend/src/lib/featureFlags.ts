import { z } from 'zod';

export const FeatureFlagSchema = z.object({
  STRIPE_ENABLED: z.boolean(),
  R2_ENABLED: z.boolean(),
});

export type FeatureFlags = z.infer<typeof FeatureFlagSchema>;

export const FLAGS: FeatureFlags = {
  STRIPE_ENABLED: false,
  R2_ENABLED: false,
} as const;

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return FLAGS[flag] === true;
}
