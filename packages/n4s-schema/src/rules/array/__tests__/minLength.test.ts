import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('minLength', () => {
  it('passes when length meets minimum', () => {
    expect(isArray<number>().minLength(1).run([1]).passes).toBe(true);
    expect(isArray<number>().minLength(1).run([1, 2]).passes).toBe(true);
    expect(isArray<number>().minLength(0).run([]).passes).toBe(true);
  });

  it('fails when length is below minimum', () => {
    expect(isArray<number>().minLength(1).run([]).passes).toBe(false);
    expect(isArray<number>().minLength(3).run([1, 2]).passes).toBe(false);
    expect(isArray<string>().minLength(5).run(['a', 'b']).passes).toBe(false);
  });
});
