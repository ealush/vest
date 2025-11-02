import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('longerThan', () => {
  it('pass when string length is greater than specified value', () => {
    expect(enforceLazy.isString().longerThan(2).run('hello').pass).toBe(true);
    expect(enforceLazy.isString().longerThan(0).run('a').pass).toBe(true);
    expect(enforceLazy.isString().longerThan(3).run('test').pass).toBe(true);
  });

  it('fails when string length is not greater', () => {
    expect(enforceLazy.isString().longerThan(5).run('hello').pass).toBe(false);
    expect(enforceLazy.isString().longerThan(5).run('hi').pass).toBe(false);
    expect(enforceLazy.isString().longerThan(0).run('').pass).toBe(false);
  });
});
