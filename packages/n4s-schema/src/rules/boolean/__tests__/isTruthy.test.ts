import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isTruthy', () => {
  it('pass for true', () => {
    expect(enforceLazy.isBoolean().isTruthy().run(true).pass).toBe(true);
  });

  it('fails for false', () => {
    expect(enforceLazy.isBoolean().isTruthy().run(false).pass).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'yes', {}, []];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isTruthy().run(value).pass).toBe(false);
    });
  });
});
