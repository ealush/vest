import { describe, it, expect } from 'vitest';

import { isBoolean } from '../isBoolean';

describe('isFalsy', () => {
  it('passes for false', () => {
    expect(isBoolean().isFalsy().run(false).passes).toBe(true);
  });

  it('fails for true', () => {
    expect(isBoolean().isFalsy().run(true).passes).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(isBoolean().isFalsy().run(value).passes).toBe(false);
    });
  });
});
