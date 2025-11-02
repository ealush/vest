import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isFalsy', () => {
  it('pass for false', () => {
    expect(enforceLazy.isBoolean().isFalsy().run(false).pass).toBe(true);
  });

  it('fails for true', () => {
    expect(enforceLazy.isBoolean().isFalsy().run(true).pass).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isFalsy().run(value).pass).toBe(false);
    });
  });
});
