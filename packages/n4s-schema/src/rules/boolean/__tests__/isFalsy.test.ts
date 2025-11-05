import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isFalsy', () => {
  it('pass for false', () => {
    expect(enforce.isBoolean().isFalsy().run(false).pass).toBe(true);
  });

  it('fails for true', () => {
    expect(enforce.isBoolean().isFalsy().run(true).pass).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforce.isBoolean().isFalsy().run(value).pass).toBe(false);
    });
  });
});
