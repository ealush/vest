import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('maxLength', () => {
  it('passes when string length is less than or equal to maximum', () => {
    expect(enforceLazy.isString().maxLength(2).run('hi').passes).toBe(true);
    expect(enforceLazy.isString().maxLength(5).run('hi').passes).toBe(true);
    expect(enforceLazy.isString().maxLength(0).run('').passes).toBe(true);
    expect(enforceLazy.isString().maxLength(5).run('hello').passes).toBe(true);
  });

  it('fails when string length is greater than maximum', () => {
    expect(enforceLazy.isString().maxLength(1).run('hi').passes).toBe(false);
    expect(enforceLazy.isString().maxLength(2).run('hello').passes).toBe(false);
    expect(enforceLazy.isString().maxLength(3).run('test').passes).toBe(false);
  });
});
