import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNotNull', () => {
  it('pass for undefined', () => {
    const value: any = undefined;
    expect(enforce.isNotNull().run(value).pass).toBe(true);
  });

  it('pass for all non-null values', () => {
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
      expect(enforce.isNotNull().run(value).pass).toBe(true);
    });
  });

  it('fails only for null', () => {
    expect(enforce.isNotNull().run(null).pass).toBe(false);
  });
});
