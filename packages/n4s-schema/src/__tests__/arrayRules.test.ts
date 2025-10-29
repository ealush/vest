import { describe, expect, it } from 'vitest';

import { isArray } from 'arrayRules';

describe('arrayRules', () => {
  it('length predicates', () => {
    expect(isArray<string>().minLength(2).run(['a', 'b']).passes).toBe(true);
    expect(isArray<number>().maxLength(2).run([1, 2]).passes).toBe(true);
    expect(isArray<number>().lengthEquals(3).run([1, 2, 3]).passes).toBe(true);
    expect(isArray<number>().lengthNotEquals(2).run([1, 2, 3]).passes).toBe(
      true,
    );
    expect(isArray<number>().longerThan(2).run([1, 2, 3]).passes).toBe(true);
    expect(isArray<number>().longerThanOrEquals(3).run([1, 2, 3]).passes).toBe(
      true,
    );
    expect(isArray<number>().shorterThan(4).run([1, 2, 3]).passes).toBe(true);
    expect(isArray<number>().shorterThanOrEquals(3).run([1, 2, 3]).passes).toBe(
      true,
    );
  });

  it('includes predicate', () => {
    expect(isArray<string>().includes('x').run(['x', 'y']).passes).toBe(true);
    expect(isArray<string>().includes('z').run(['x', 'y']).passes).toBe(false);
  });

  it('fails when not an array', () => {
    // @ts-expect-error runtime check only
    expect(isArray().run('not array' as any).passes).toBe(false);
  });
});
