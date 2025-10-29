import { isBoolean } from 'booleanRules';
import { describe, expect, it } from 'vitest';

describe('booleanRules', () => {
  it('supports isTrue and isFalse', () => {
    expect(isBoolean().isTrue().run(true).passes).toBe(true);
    expect(isBoolean().isFalse().run(false).passes).toBe(true);
  });

  it('fails when predicates do not match', () => {
    expect(isBoolean().isTrue().run(false).passes).toBe(false);
    expect(isBoolean().isFalse().run(true).passes).toBe(false);
  });

  it('equals works', () => {
    expect(isBoolean().equals(true).run(true).passes).toBe(true);
    expect(isBoolean().equals(false).run(true).passes).toBe(false);
  });
});
