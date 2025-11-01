import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('shorterThanOrEquals', () => {
  it('passes when array length is less than or equal', () => {
    expect(isArray<number>().shorterThanOrEquals(2).run([1, 2]).passes).toBe(
      true,
    );
    expect(isArray<number>().shorterThanOrEquals(3).run([1, 2]).passes).toBe(
      true,
    );
    expect(isArray<number>().shorterThanOrEquals(0).run([]).passes).toBe(true);
  });

  it('fails when array length is greater', () => {
    expect(isArray<number>().shorterThanOrEquals(1).run([1, 2]).passes).toBe(
      false,
    );
    expect(
      isArray<string>().shorterThanOrEquals(1).run(['a', 'b', 'c']).passes,
    ).toBe(false);
  });
});
