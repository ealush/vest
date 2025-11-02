import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isFalse', () => {
  it('pass only for false', () => {
    expect(enforceLazy.isBoolean().isFalse().run(false).pass).toBe(true);
  });

  it('fails for true', () => {
    expect(enforceLazy.isBoolean().isFalse().run(true).pass).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isFalse().run(value).pass).toBe(false);
    });
  });
});
