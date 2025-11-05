import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('maxLength', () => {
  it('pass when length is within maximum', () => {
    expect(enforce.isArray<number>().maxLength(2).run([1, 2]).pass).toBe(true);
    expect(enforce.isArray<number>().maxLength(2).run([1]).pass).toBe(true);
    expect(enforce.isArray<number>().maxLength(0).run([]).pass).toBe(true);
  });

  it('fails when length exceeds maximum', () => {
    expect(enforce.isArray<number>().maxLength(1).run([1, 2]).pass).toBe(false);
    expect(enforce.isArray<number>().maxLength(0).run([1]).pass).toBe(false);
    expect(
      enforce.isArray<string>().maxLength(2).run(['a', 'b', 'c']).pass,
    ).toBe(false);
  });
});
