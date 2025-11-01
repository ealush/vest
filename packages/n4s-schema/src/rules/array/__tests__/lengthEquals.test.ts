import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('lengthEquals', () => {
  it('passes when length matches exactly', () => {
    expect(isArray<number>().lengthEquals(2).run([1, 2]).passes).toBe(true);
    expect(isArray<number>().lengthEquals(0).run([]).passes).toBe(true);
    expect(isArray<string>().lengthEquals(3).run(['a', 'b', 'c']).passes).toBe(
      true,
    );
  });

  it('fails when length differs', () => {
    expect(isArray<number>().lengthEquals(1).run([]).passes).toBe(false);
    expect(isArray<number>().lengthEquals(1).run([1, 2]).passes).toBe(false);
    expect(isArray<string>().lengthEquals(5).run(['a', 'b']).passes).toBe(
      false,
    );
  });
});
