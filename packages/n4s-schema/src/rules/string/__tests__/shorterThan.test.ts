import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('shorterThan', () => {
  it('pass when string length is less than specified value', () => {
    expect(enforceLazy.isString().shorterThan(6).run('hello').pass).toBe(true);
    expect(enforceLazy.isString().shorterThan(5).run('test').pass).toBe(true);
    expect(enforceLazy.isString().shorterThan(1).run('').pass).toBe(true);
  });

  it('fails when string length is not less', () => {
    expect(enforceLazy.isString().shorterThan(5).run('hello').pass).toBe(false);
    expect(enforceLazy.isString().shorterThan(3).run('hello').pass).toBe(false);
    expect(enforceLazy.isString().shorterThan(0).run('').pass).toBe(false);
  });
});
