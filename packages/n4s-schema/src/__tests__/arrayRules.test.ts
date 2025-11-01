import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('arrayRules', () => {
  it('length predicates', () => {
    expect(
      enforceLazy.isArray<string>().minLength(2).run(['a', 'b']).passes,
    ).toBe(true);
    expect(enforceLazy.isArray<number>().maxLength(2).run([1, 2]).passes).toBe(
      true,
    );
    expect(
      enforceLazy.isArray<number>().lengthEquals(3).run([1, 2, 3]).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().lengthNotEquals(2).run([1, 2, 3]).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().longerThan(2).run([1, 2, 3]).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().longerThanOrEquals(3).run([1, 2, 3]).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().shorterThan(4).run([1, 2, 3]).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<number>().shorterThanOrEquals(3).run([1, 2, 3])
        .passes,
    ).toBe(true);
  });

  it('includes predicate', () => {
    expect(
      enforceLazy.isArray<string>().includes('x').run(['x', 'y']).passes,
    ).toBe(true);
    expect(
      enforceLazy.isArray<string>().includes('z').run(['x', 'y']).passes,
    ).toBe(false);
  });

  it('fails when not an array', () => {
    expect(enforceLazy.isArray().run('not array').passes).toBe(false);
  });
});
