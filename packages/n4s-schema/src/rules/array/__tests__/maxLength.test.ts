import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('maxLength', () => {
  it('passes when length is within maximum', () => {
    expect(enforceLazy.isArray<number>().maxLength(2).run([1, 2]).passes).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().maxLength(2).run([1]).passes).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().maxLength(0).run([]).passes).toBe(
      true,
    );
  });

  it('fails when length exceeds maximum', () => {
    expect(enforceLazy.isArray<number>().maxLength(1).run([1, 2]).passes).toBe(
      false,
    );
    expect(enforceLazy.isArray<number>().maxLength(0).run([1]).passes).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().maxLength(2).run(['a', 'b', 'c']).passes,
    ).toBe(false);
  });
});
