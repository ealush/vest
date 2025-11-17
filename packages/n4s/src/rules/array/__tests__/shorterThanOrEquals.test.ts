import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('shorterThanOrEquals', () => {
  it('pass when array length is less than or equal', () => {
    expect(
      enforce.isArray<number>().shorterThanOrEquals(2).run([1, 2]).pass,
    ).toBe(true);
    expect(
      enforce.isArray<number>().shorterThanOrEquals(3).run([1, 2]).pass,
    ).toBe(true);
    expect(enforce.isArray<number>().shorterThanOrEquals(0).run([]).pass).toBe(
      true,
    );
  });

  it('fails when array length is greater', () => {
    expect(
      enforce.isArray<number>().shorterThanOrEquals(1).run([1, 2]).pass,
    ).toBe(false);
    expect(
      enforce.isArray<string>().shorterThanOrEquals(1).run(['a', 'b', 'c'])
        .pass,
    ).toBe(false);
  });
});
