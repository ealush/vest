import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('includes', () => {
  it('passes when item is in array', () => {
    expect(isArray<number>().includes(2).run([1, 2]).passes).toBe(true);
    expect(isArray<string>().includes('a').run(['a', 'b']).passes).toBe(true);
    expect(isArray<number>().includes(1).run([1]).passes).toBe(true);
  });

  it('fails when item is not in array', () => {
    expect(isArray<number>().includes(3).run([1, 2]).passes).toBe(false);
    expect(isArray<string>().includes('c').run(['a', 'b']).passes).toBe(false);
    expect(isArray<number>().includes(1).run([]).passes).toBe(false);
  });
});
