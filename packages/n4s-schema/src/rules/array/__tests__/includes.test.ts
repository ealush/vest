import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('includes', () => {
  it('passes when item is in array', () => {
    expect(enforceLazy.isArray<number>().includes(2).run([1, 2]).passes).toBe(
      true,
    );
    expect(
      enforceLazy.isArray<string>().includes('a').run(['a', 'b']).passes,
    ).toBe(true);
    expect(enforceLazy.isArray<number>().includes(1).run([1]).passes).toBe(
      true,
    );
  });

  it('fails when item is not in array', () => {
    expect(enforceLazy.isArray<number>().includes(3).run([1, 2]).passes).toBe(
      false,
    );
    expect(
      enforceLazy.isArray<string>().includes('c').run(['a', 'b']).passes,
    ).toBe(false);
    expect(enforceLazy.isArray<number>().includes(1).run([]).passes).toBe(
      false,
    );
  });
});
