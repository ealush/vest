import { describe, it, expect } from 'vitest';

import { isNotUndefined } from '../nullish/isNotUndefined';

describe('isNotUndefined', () => {
  it('passes for null', () => {
    const value: any = null;
    expect(isNotUndefined().run(value).passes).toBe(true);
  });

  it('passes for all defined values', () => {
    const values: any[] = [
      null,
      0,
      '',
      false,
      NaN,
      1,
      'text',
      true,
      {},
      [],
      () => {},
    ];

    values.forEach(value => {
      expect(isNotUndefined().run(value).passes).toBe(true);
    });
  });

  it('fails only for undefined', () => {
    expect(isNotUndefined().run(undefined).passes).toBe(false);

    let uninitialized: any;
    expect(isNotUndefined().run(uninitialized).passes).toBe(false);
  });
});
