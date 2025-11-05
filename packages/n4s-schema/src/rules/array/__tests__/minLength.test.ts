import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('minLength', () => {
  it('pass when length meets minimum', () => {
    expect(enforce.isArray<number>().minLength(1).run([1]).pass).toBe(true);
    expect(enforce.isArray<number>().minLength(1).run([1, 2]).pass).toBe(true);
    expect(enforce.isArray<number>().minLength(0).run([]).pass).toBe(true);
  });

  it('fails when length is below minimum', () => {
    expect(enforce.isArray<number>().minLength(1).run([]).pass).toBe(false);
    expect(enforce.isArray<number>().minLength(3).run([1, 2]).pass).toBe(false);
    expect(enforce.isArray<string>().minLength(5).run(['a', 'b']).pass).toBe(
      false,
    );
  });
});
