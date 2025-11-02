import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('lengthEquals', () => {
  it('pass when length matches exactly', () => {
    expect(enforceLazy.isArray<number>().lengthEquals(2).run([1, 2]).pass).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().lengthEquals(0).run([]).pass).toBe(
      true,
    );
    expect(
      enforceLazy.isArray<string>().lengthEquals(3).run(['a', 'b', 'c']).pass,
    ).toBe(true);
  });

  it('fails when length differs', () => {
    expect(enforceLazy.isArray<number>().lengthEquals(1).run([]).pass).toBe(
      false,
    );
    expect(enforceLazy.isArray<number>().lengthEquals(1).run([1, 2]).pass).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().lengthEquals(5).run(['a', 'b']).pass,
    ).toBe(false);
  });
});
