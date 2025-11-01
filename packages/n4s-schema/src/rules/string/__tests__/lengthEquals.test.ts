import { describe, it, expect } from 'vitest';

import { isString } from '../isString';

describe('lengthEquals', () => {
  it('passes when string length equals the specified value', () => {
    expect(isString().lengthEquals(5).run('hello').passes).toBe(true);
    expect(isString().lengthEquals(0).run('').passes).toBe(true);
    expect(isString().lengthEquals(3).run('abc').passes).toBe(true);
    expect(isString().lengthEquals(4).run('test').passes).toBe(true);
  });

  it('fails when string length does not equal the specified value', () => {
    expect(isString().lengthEquals(3).run('hello').passes).toBe(false);
    expect(isString().lengthEquals(1).run('').passes).toBe(false);
    expect(isString().lengthEquals(5).run('test').passes).toBe(false);
  });
});
