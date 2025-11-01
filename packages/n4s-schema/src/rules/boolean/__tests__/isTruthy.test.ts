import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isTruthy', () => {
  it('passes for true', () => {
    expect(enforceLazy.isBoolean().isTruthy().run(true).passes).toBe(true);
  });

  it('fails for false', () => {
    expect(enforceLazy.isBoolean().isTruthy().run(false).passes).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'yes', {}, []];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isTruthy().run(value).passes).toBe(false);
    });
  });
});
