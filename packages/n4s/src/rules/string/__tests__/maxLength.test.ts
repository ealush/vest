import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('maxLength', () => {
  it('pass when string length is less than or equal to maximum', () => {
    expect(enforce.isString().maxLength(2).run('hi').pass).toBe(true);
    expect(enforce.isString().maxLength(5).run('hi').pass).toBe(true);
    expect(enforce.isString().maxLength(0).run('').pass).toBe(true);
    expect(enforce.isString().maxLength(5).run('hello').pass).toBe(true);
  });

  it('fails when string length is greater than maximum', () => {
    expect(enforce.isString().maxLength(1).run('hi').pass).toBe(false);
    expect(enforce.isString().maxLength(2).run('hello').pass).toBe(false);
    expect(enforce.isString().maxLength(3).run('test').pass).toBe(false);
  });
});
