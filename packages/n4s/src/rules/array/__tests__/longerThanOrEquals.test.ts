import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('longerThanOrEquals', () => {
  it('pass when array length is greater than or equal', () => {
    expect(
      enforce.isArray<number>().longerThanOrEquals(2).run([1, 2]).pass,
    ).toBe(true);
    expect(
      enforce.isArray<number>().longerThanOrEquals(1).run([1, 2]).pass,
    ).toBe(true);
    expect(enforce.isArray<number>().longerThanOrEquals(0).run([]).pass).toBe(
      true,
    );
  });

  it('fails when array length is less', () => {
    expect(
      enforce.isArray<number>().longerThanOrEquals(3).run([1, 2]).pass,
    ).toBe(false);
    expect(enforce.isArray<number>().longerThanOrEquals(1).run([]).pass).toBe(
      false,
    );
    expect(
      enforce.isArray<string>().longerThanOrEquals(5).run(['a', 'b']).pass,
    ).toBe(false);
  });
});
