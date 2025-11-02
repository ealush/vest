import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('minLength', () => {
  it('pass when length meets minimum', () => {
    expect(enforceLazy.isArray<number>().minLength(1).run([1]).pass).toBe(true);
    expect(enforceLazy.isArray<number>().minLength(1).run([1, 2]).pass).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().minLength(0).run([]).pass).toBe(true);
  });

  it('fails when length is below minimum', () => {
    expect(enforceLazy.isArray<number>().minLength(1).run([]).pass).toBe(false);
    expect(enforceLazy.isArray<number>().minLength(3).run([1, 2]).pass).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().minLength(5).run(['a', 'b']).pass,
    ).toBe(false);
  });
});
