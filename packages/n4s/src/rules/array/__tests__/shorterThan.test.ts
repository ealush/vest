import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('shorterThan', () => {
  it('pass when array length is less', () => {
    expect(enforce.isArray<number>().shorterThan(3).run([1, 2]).pass).toBe(
      true,
    );
    expect(enforce.isArray<number>().shorterThan(1).run([]).pass).toBe(true);
    expect(enforce.isArray<string>().shorterThan(5).run(['a', 'b']).pass).toBe(
      true,
    );
  });

  it('fails when array length is equal or greater', () => {
    expect(enforce.isArray<number>().shorterThan(2).run([1, 2]).pass).toBe(
      false,
    );
    expect(enforce.isArray<number>().shorterThan(1).run([1, 2]).pass).toBe(
      false,
    );
    expect(enforce.isArray<string>().shorterThan(0).run([]).pass).toBe(false);
  });
});
