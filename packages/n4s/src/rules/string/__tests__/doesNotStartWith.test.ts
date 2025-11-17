import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('doesNotStartWith', () => {
  it('pass when string does not start with prefix', () => {
    expect(enforce.isString().doesNotStartWith('x').run('hello').pass).toBe(
      true,
    );
    expect(enforce.isString().doesNotStartWith('lo').run('hello').pass).toBe(
      true,
    );
  });

  it('fails when string starts with prefix', () => {
    expect(enforce.isString().doesNotStartWith('he').run('hello').pass).toBe(
      false,
    );
    expect(enforce.isString().doesNotStartWith('hel').run('hello').pass).toBe(
      false,
    );
  });
});
