import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNotUndefined', () => {
  it('passes for null', () => {
    const value: any = null;
    expect(enforceLazy.isNotUndefined().run(value).passes).toBe(true);
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
      expect(enforceLazy.isNotUndefined().run(value).passes).toBe(true);
    });
  });

  it('fails only for undefined', () => {
    expect(enforceLazy.isNotUndefined().run(undefined).passes).toBe(false);

    let uninitialized: any;
    expect(enforceLazy.isNotUndefined().run(uninitialized).passes).toBe(false);
  });
});
