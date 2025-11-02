import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('minLength', () => {
  it('pass when string length is greater than or equal to minimum', () => {
    expect(enforceLazy.isString().minLength(2).run('hi').pass).toBe(true);
    expect(enforceLazy.isString().minLength(2).run('hello').pass).toBe(true);
    expect(enforceLazy.isString().minLength(0).run('').pass).toBe(true);
    expect(enforceLazy.isString().minLength(3).run('abc').pass).toBe(true);
  });

  it('fails when string length is less than minimum', () => {
    expect(enforceLazy.isString().minLength(3).run('hi').pass).toBe(false);
    expect(enforceLazy.isString().minLength(1).run('').pass).toBe(false);
    expect(enforceLazy.isString().minLength(5).run('test').pass).toBe(false);
  });
});
