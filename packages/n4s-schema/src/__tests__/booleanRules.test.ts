import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('booleanRules', () => {
  it('supports isTrue and isFalse', () => {
    expect(enforceLazy.isBoolean().isTrue().run(true).passes).toBe(true);
    expect(enforceLazy.isBoolean().isFalse().run(false).passes).toBe(true);
  });

  it('fails when predicates do not match', () => {
    expect(enforceLazy.isBoolean().isTrue().run(false).passes).toBe(false);
    expect(enforceLazy.isBoolean().isFalse().run(true).passes).toBe(false);
  });

  it('equals works', () => {
    expect(enforceLazy.isBoolean().equals(true).run(true).passes).toBe(true);
    expect(enforceLazy.isBoolean().equals(false).run(true).passes).toBe(false);
  });
});
