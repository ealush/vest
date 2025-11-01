import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('minLength', () => {
  it('passes when string length is greater than or equal to minimum', () => {
    expect(enforceLazy.isString().minLength(2).run('hi').passes).toBe(true);
    expect(enforceLazy.isString().minLength(2).run('hello').passes).toBe(true);
    expect(enforceLazy.isString().minLength(0).run('').passes).toBe(true);
    expect(enforceLazy.isString().minLength(3).run('abc').passes).toBe(true);
  });

  it('fails when string length is less than minimum', () => {
    expect(enforceLazy.isString().minLength(3).run('hi').passes).toBe(false);
    expect(enforceLazy.isString().minLength(1).run('').passes).toBe(false);
    expect(enforceLazy.isString().minLength(5).run('test').passes).toBe(false);
  });
});
