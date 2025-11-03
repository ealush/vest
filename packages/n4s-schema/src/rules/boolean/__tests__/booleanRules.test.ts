import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('booleanRules', () => {
  it('supports isTrue and isFalse', () => {
    expect(enforceLazy.isBoolean().isTrue().run(true).pass).toBe(true);
    expect(enforceLazy.isBoolean().isFalse().run(false).pass).toBe(true);
  });

  it('fails when predicates do not match', () => {
    expect(enforceLazy.isBoolean().isTrue().run(false).pass).toBe(false);
    expect(enforceLazy.isBoolean().isFalse().run(true).pass).toBe(false);
  });

  it('equals works', () => {
    expect(enforceLazy.isBoolean().equals(true).run(true).pass).toBe(true);
    expect(enforceLazy.isBoolean().equals(false).run(true).pass).toBe(false);
  });
});
