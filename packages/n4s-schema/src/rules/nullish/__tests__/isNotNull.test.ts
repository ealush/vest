import { describe, it, expect } from 'vitest';

import { isNotNull } from '../isNotNull';

describe('isNotNull', () => {
  it('passes for undefined', () => {
    const value: any = undefined;
    expect(isNotNull().run(value).passes).toBe(true);
  });

  it('passes for all non-null values', () => {
    const values: any[] = [
      0,
      '',
      false,
      NaN,
      undefined,
      1,
      'text',
      true,
      {},
      [],
      () => {},
    ];

    values.forEach(value => {
      expect(isNotNull().run(value).passes).toBe(true);
    });
  });

  it('fails only for null', () => {
    expect(isNotNull().run(null).passes).toBe(false);
  });
});
