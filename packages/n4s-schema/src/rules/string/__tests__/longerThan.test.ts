import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('longerThan', () => {
  it('passes when string length is greater than specified value', () => {
    expect(enforceLazy.isString().longerThan(2).run('hello').passes).toBe(true);
    expect(enforceLazy.isString().longerThan(0).run('a').passes).toBe(true);
    expect(enforceLazy.isString().longerThan(3).run('test').passes).toBe(true);
  });

  it('fails when string length is not greater', () => {
    expect(enforceLazy.isString().longerThan(5).run('hello').passes).toBe(
      false,
    );
    expect(enforceLazy.isString().longerThan(5).run('hi').passes).toBe(false);
    expect(enforceLazy.isString().longerThan(0).run('').passes).toBe(false);
  });
});
