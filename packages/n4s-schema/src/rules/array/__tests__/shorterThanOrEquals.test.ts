import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('shorterThanOrEquals', () => {
  it('pass when array length is less than or equal', () => {
    expect(
      enforceLazy.isArray<number>().shorterThanOrEquals(2).run([1, 2]).pass,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().shorterThanOrEquals(3).run([1, 2]).pass,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().shorterThanOrEquals(0).run([]).pass,
    ).toBe(true);
  });

  it('fails when array length is greater', () => {
    expect(
      enforceLazy.isArray<number>().shorterThanOrEquals(1).run([1, 2]).pass,
    ).toBe(false);
    expect(
      enforceLazy.isArray<string>().shorterThanOrEquals(1).run(['a', 'b', 'c'])
        .pass,
    ).toBe(false);
  });
});
