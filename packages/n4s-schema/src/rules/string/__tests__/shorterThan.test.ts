import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('shorterThan', () => {
  it('passes when string length is less than specified value', () => {
    expect(enforceLazy.isString().shorterThan(6).run('hello').passes).toBe(true);
    expect(enforceLazy.isString().shorterThan(5).run('test').passes).toBe(true);
    expect(enforceLazy.isString().shorterThan(1).run('').passes).toBe(true);
  });

  it('fails when string length is not less', () => {
    expect(enforceLazy.isString().shorterThan(5).run('hello').passes).toBe(false);
    expect(enforceLazy.isString().shorterThan(3).run('hello').passes).toBe(false);
    expect(enforceLazy.isString().shorterThan(0).run('').passes).toBe(false);
  });
});
