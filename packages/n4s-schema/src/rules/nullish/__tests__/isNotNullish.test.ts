import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNullish', () => {
  it('pass for falsy non-nullish values', () => {
    const values: any[] = [0, '', false, NaN];

    values.forEach(value => {
      expect(enforceLazy.isNotNullish().run(value).pass).toBe(true);
    });
  });

  it('pass for truthy values', () => {
    const values: any[] = [1, 'text', true, {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isNotNullish().run(value).pass).toBe(true);
    });
  });

  it('fails for null', () => {
    expect(enforceLazy.isNotNullish().run(null).pass).toBe(false);
  });

  it('fails for undefined', () => {
    expect(enforceLazy.isNotNullish().run(undefined).pass).toBe(false);

    let uninitialized: any;
    expect(enforceLazy.isNotNullish().run(uninitialized).pass).toBe(false);
  });
});
