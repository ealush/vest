import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('booleanRules', () => {
  it('supports isTrue and isFalse', () => {
    expect(enforce.isBoolean().isTrue().run(true).pass).toBe(true);
    expect(enforce.isBoolean().isFalse().run(false).pass).toBe(true);
  });

  it('fails when predicates do not match', () => {
    expect(enforce.isBoolean().isTrue().run(false).pass).toBe(false);
    expect(enforce.isBoolean().isFalse().run(true).pass).toBe(false);
  });

  it('equals works', () => {
    expect(enforce.isBoolean().equals(true).run(true).pass).toBe(true);
    expect(enforce.isBoolean().equals(false).run(true).pass).toBe(false);
  });
});
