import { describe, it, expect } from 'vitest';
import { FLAGS, isFeatureEnabled } from '@/lib/featureFlags';

describe('Feature Flags', () => {
  it('has expected default values', () => {
    expect(FLAGS.STRIPE_ENABLED).toBe(false);
    expect(FLAGS.R2_ENABLED).toBe(false);
  });

  it('isFeatureEnabled returns correct values', () => {
    expect(isFeatureEnabled('STRIPE_ENABLED')).toBe(false);
    expect(isFeatureEnabled('R2_ENABLED')).toBe(false);
  });
});
