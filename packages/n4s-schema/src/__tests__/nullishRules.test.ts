import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('nullishRules', () => {
  it('isNull / isNotNull', () => {
    expect(enforceLazy.isNull().run(null).pass).toBe(true);
    expect(enforceLazy.isNull().run(undefined).pass).toBe(false);
    expect(enforceLazy.isNotNull().run(0).pass).toBe(true);
    expect(enforceLazy.isNotNull().run(null).pass).toBe(false);
  });

  it('isUndefined / isNotUndefined', () => {
    expect(enforceLazy.isUndefined().run(undefined).pass).toBe(true);
    expect(enforceLazy.isUndefined().run(null).pass).toBe(false);
    expect(enforceLazy.isNotUndefined().run('x').pass).toBe(true);
    expect(enforceLazy.isNotUndefined().run(undefined).pass).toBe(false);
  });

  it('isNullish / isNotNullish', () => {
    expect(enforceLazy.isNullish().run(undefined).pass).toBe(true);
    expect(enforceLazy.isNullish().run(null).pass).toBe(true);
    expect(enforceLazy.isNullish().run(0).pass).toBe(false);

    expect(enforceLazy.isNotNullish().run(0).pass).toBe(true);
    expect(enforceLazy.isNotNullish().run('').pass).toBe(true);
    expect(enforceLazy.isNotNullish().run(undefined).pass).toBe(false);
  });
});
