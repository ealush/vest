import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('longerThan', () => {
  it('pass when string length is greater than specified value', () => {
    expect(enforce.isString().longerThan(2).run('hello').pass).toBe(true);
    expect(enforce.isString().longerThan(0).run('a').pass).toBe(true);
    expect(enforce.isString().longerThan(3).run('test').pass).toBe(true);
  });

  it('fails when string length is not greater', () => {
    expect(enforce.isString().longerThan(5).run('hello').pass).toBe(false);
    expect(enforce.isString().longerThan(5).run('hi').pass).toBe(false);
    expect(enforce.isString().longerThan(0).run('').pass).toBe(false);
  });
});
