import { describe, it, expect } from 'vitest';

import { isNotNullish } from '../nullish/isNotNullish';

describe('isNotNullish', () => {
  it('passes for falsy non-nullish values', () => {
    const values: any[] = [0, '', false, NaN];

    values.forEach(value => {
      expect(isNotNullish().run(value).passes).toBe(true);
    });
  });

  it('passes for truthy values', () => {
    const values: any[] = [1, 'text', true, {}, [], () => {}];

    values.forEach(value => {
      expect(isNotNullish().run(value).passes).toBe(true);
    });
  });

  it('fails for null', () => {
    expect(isNotNullish().run(null).passes).toBe(false);
  });

  it('fails for undefined', () => {
    expect(isNotNullish().run(undefined).passes).toBe(false);

    let uninitialized: any;
    expect(isNotNullish().run(uninitialized).passes).toBe(false);
  });
});
