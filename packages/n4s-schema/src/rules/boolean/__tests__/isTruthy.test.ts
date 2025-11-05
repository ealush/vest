import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isTruthy', () => {
  it('pass for true', () => {
    expect(enforce.isBoolean().isTruthy().run(true).pass).toBe(true);
  });

  it('fails for false', () => {
    expect(enforce.isBoolean().isTruthy().run(false).pass).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'yes', {}, []];

    values.forEach(value => {
      expect(enforce.isBoolean().isTruthy().run(value).pass).toBe(false);
    });
  });
});
