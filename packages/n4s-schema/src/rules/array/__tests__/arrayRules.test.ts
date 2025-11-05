import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('arrayRules', () => {
  it('length predicates', () => {
    expect(enforce.isArray<string>().minLength(2).run(['a', 'b']).pass).toBe(
      true,
    );
    expect(enforce.isArray<number>().maxLength(2).run([1, 2]).pass).toBe(true);
    expect(enforce.isArray<number>().lengthEquals(3).run([1, 2, 3]).pass).toBe(
      true,
    );
    expect(
      enforce.isArray<number>().lengthNotEquals(2).run([1, 2, 3]).pass,
    ).toBe(true);
    expect(enforce.isArray<number>().longerThan(2).run([1, 2, 3]).pass).toBe(
      true,
    );
    expect(
      enforce.isArray<number>().longerThanOrEquals(3).run([1, 2, 3]).pass,
    ).toBe(true);
    expect(enforce.isArray<number>().shorterThan(4).run([1, 2, 3]).pass).toBe(
      true,
    );
    expect(
      enforce.isArray<number>().shorterThanOrEquals(3).run([1, 2, 3]).pass,
    ).toBe(true);
  });

  it('includes predicate', () => {
    expect(enforce.isArray<string>().includes('x').run(['x', 'y']).pass).toBe(
      true,
    );
    expect(enforce.isArray<string>().includes('z').run(['x', 'y']).pass).toBe(
      false,
    );
  });

  it('fails when not an array', () => {
    expect(enforce.isArray().run('not array').pass).toBe(false);
  });
});
