import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNotUndefined', () => {
  it('pass for null', () => {
    const value: any = null;
    expect(enforce.isNotUndefined().run(value).pass).toBe(true);
  });

  it('pass for all defined values', () => {
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
      expect(enforce.isNotUndefined().run(value).pass).toBe(true);
    });
  });

  it('fails only for undefined', () => {
    expect(enforce.isNotUndefined().run(undefined).pass).toBe(false);

    let uninitialized: any;
    expect(enforce.isNotUndefined().run(uninitialized).pass).toBe(false);
  });
});
