import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNullish', () => {
  it('passes for falsy non-nullish values', () => {
    const values: any[] = [0, '', false, NaN];

    values.forEach(value => {
      expect(enforceLazy.isNotNullish().run(value).passes).toBe(true);
    });
  });

  it('passes for truthy values', () => {
    const values: any[] = [1, 'text', true, {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isNotNullish().run(value).passes).toBe(true);
    });
  });

  it('fails for null', () => {
    expect(enforceLazy.isNotNullish().run(null).passes).toBe(false);
  });

  it('fails for undefined', () => {
    expect(enforceLazy.isNotNullish().run(undefined).passes).toBe(false);

    let uninitialized: any;
    expect(enforceLazy.isNotNullish().run(uninitialized).passes).toBe(false);
  });
});
