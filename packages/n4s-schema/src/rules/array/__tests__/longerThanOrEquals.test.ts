import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('longerThanOrEquals', () => {
  it('passes when array length is greater than or equal', () => {
    expect(enforceLazy.isArray<number>().longerThanOrEquals(2).run([1, 2]).passes).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().longerThanOrEquals(1).run([1, 2]).passes).toBe(
      true,
    );
    expect(enforceLazy.isArray<number>().longerThanOrEquals(0).run([]).passes).toBe(true);
  });

  it('fails when array length is less', () => {
    expect(enforceLazy.isArray<number>().longerThanOrEquals(3).run([1, 2]).passes).toBe(
      false,
    );
    expect(enforceLazy.isArray<number>().longerThanOrEquals(1).run([]).passes).toBe(false);
    expect(enforceLazy.isArray<string>().longerThanOrEquals(5).run(['a', 'b']).passes).toBe(
      false,
    );
  });
});
