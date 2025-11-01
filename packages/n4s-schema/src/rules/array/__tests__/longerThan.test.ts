import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('longerThan', () => {
  it('passes when array length is greater', () => {
    expect(enforceLazy.isArray<number>().longerThan(1).run([1, 2]).passes).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().longerThan(0).run([1]).passes).toBe(
      true,
    );
    expect(
      enforceLazy.isArray<string>().longerThan(2).run(['a', 'b', 'c']).passes,
    ).toBe(true);
  });

  it('fails when array length is equal or less', () => {
    expect(enforceLazy.isArray<number>().longerThan(2).run([1, 2]).passes).toBe(
      false,
    );
    expect(enforceLazy.isArray<number>().longerThan(3).run([1, 2]).passes).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().longerThan(5).run(['a', 'b']).passes,
    ).toBe(false);
  });
});
