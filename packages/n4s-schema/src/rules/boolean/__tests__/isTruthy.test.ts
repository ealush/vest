import { describe, it, expect } from 'vitest';

import { isBoolean } from '../isBoolean';

describe('isTruthy', () => {
  it('passes for true', () => {
    expect(isBoolean().isTruthy().run(true).passes).toBe(true);
  });

  it('fails for false', () => {
    expect(isBoolean().isTruthy().run(false).passes).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'yes', {}, []];

    values.forEach(value => {
      expect(isBoolean().isTruthy().run(value).passes).toBe(false);
    });
  });
});
