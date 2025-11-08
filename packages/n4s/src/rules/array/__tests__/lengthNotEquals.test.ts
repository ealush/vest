import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('lengthNotEquals', () => {
  it('pass when length differs', () => {
    expect(enforce.isArray<number>().lengthNotEquals(0).run([1]).pass).toBe(
      true,
    );
    expect(enforce.isArray<number>().lengthNotEquals(1).run([]).pass).toBe(
      true,
    );
    expect(
      enforce.isArray<string>().lengthNotEquals(5).run(['a', 'b']).pass,
    ).toBe(true);
  });

  it('fails when length matches', () => {
    expect(enforce.isArray<number>().lengthNotEquals(0).run([]).pass).toBe(
      false,
    );
    expect(enforce.isArray<number>().lengthNotEquals(2).run([1, 2]).pass).toBe(
      false,
    );
    expect(
      enforce.isArray<string>().lengthNotEquals(3).run(['a', 'b', 'c']).pass,
    ).toBe(false);
  });
});
