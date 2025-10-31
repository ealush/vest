import { describe, expect, it } from 'vitest';

import { enforceLazy } from '../lazy';

describe('nullishRules', () => {
  it('isNull / isNotNull', () => {
    expect(enforceLazy.isNull().run(null).passes).toBe(true);
    expect(enforceLazy.isNull().run(undefined).passes).toBe(false);
    expect(enforceLazy.isNotNull().run(0).passes).toBe(true);
    expect(enforceLazy.isNotNull().run(null).passes).toBe(false);
  });

  it('isUndefined / isNotUndefined', () => {
    expect(enforceLazy.isUndefined().run(undefined).passes).toBe(true);
    expect(enforceLazy.isUndefined().run(null).passes).toBe(false);
    expect(enforceLazy.isNotUndefined().run('x').passes).toBe(true);
    expect(enforceLazy.isNotUndefined().run(undefined).passes).toBe(false);
  });

  it('isNullish / isNotNullish', () => {
    expect(enforceLazy.isNullish().run(undefined).passes).toBe(true);
    expect(enforceLazy.isNullish().run(null).passes).toBe(true);
    expect(enforceLazy.isNullish().run(0).passes).toBe(false);

    expect(enforceLazy.isNotNullish().run(0).passes).toBe(true);
    expect(enforceLazy.isNotNullish().run('').passes).toBe(true);
    expect(enforceLazy.isNotNullish().run(undefined).passes).toBe(false);
  });
});
