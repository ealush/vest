import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('longerThan', () => {
  it('pass when array length is greater', () => {
    expect(enforceLazy.isArray<number>().longerThan(1).run([1, 2]).pass).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().longerThan(0).run([1]).pass).toBe(
      true,
    );
    expect(
      enforceLazy.isArray<string>().longerThan(2).run(['a', 'b', 'c']).pass,
    ).toBe(true);
  });

  it('fails when array length is equal or less', () => {
    expect(enforceLazy.isArray<number>().longerThan(2).run([1, 2]).pass).toBe(
      false,
    );
    expect(enforceLazy.isArray<number>().longerThan(3).run([1, 2]).pass).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().longerThan(5).run(['a', 'b']).pass,
    ).toBe(false);
  });
});
