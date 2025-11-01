import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('shorterThan', () => {
  it('passes when array length is less', () => {
    expect(isArray<number>().shorterThan(3).run([1, 2]).passes).toBe(true);
    expect(isArray<number>().shorterThan(1).run([]).passes).toBe(true);
    expect(isArray<string>().shorterThan(5).run(['a', 'b']).passes).toBe(true);
  });

  it('fails when array length is equal or greater', () => {
    expect(isArray<number>().shorterThan(2).run([1, 2]).passes).toBe(false);
    expect(isArray<number>().shorterThan(1).run([1, 2]).passes).toBe(false);
    expect(isArray<string>().shorterThan(0).run([]).passes).toBe(false);
  });
});
