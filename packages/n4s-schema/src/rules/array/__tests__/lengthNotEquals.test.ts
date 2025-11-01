import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('lengthNotEquals', () => {
  it('passes when length differs', () => {
    expect(isArray<number>().lengthNotEquals(0).run([1]).passes).toBe(true);
    expect(isArray<number>().lengthNotEquals(1).run([]).passes).toBe(true);
    expect(isArray<string>().lengthNotEquals(5).run(['a', 'b']).passes).toBe(
      true,
    );
  });

  it('fails when length matches', () => {
    expect(isArray<number>().lengthNotEquals(0).run([]).passes).toBe(false);
    expect(isArray<number>().lengthNotEquals(2).run([1, 2]).passes).toBe(false);
    expect(
      isArray<string>().lengthNotEquals(3).run(['a', 'b', 'c']).passes,
    ).toBe(false);
  });
});
