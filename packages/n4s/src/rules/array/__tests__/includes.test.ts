import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('includes', () => {
  it('pass when item is in array', () => {
    expect(enforce.isArray<number>().includes(2).run([1, 2]).pass).toBe(true);
    expect(enforce.isArray<string>().includes('a').run(['a', 'b']).pass).toBe(
      true,
    );
    expect(enforce.isArray<number>().includes(1).run([1]).pass).toBe(true);
  });

  it('fails when item is not in array', () => {
    expect(enforce.isArray<number>().includes(3).run([1, 2]).pass).toBe(false);
    expect(enforce.isArray<string>().includes('c').run(['a', 'b']).pass).toBe(
      false,
    );
    expect(enforce.isArray<number>().includes(1).run([]).pass).toBe(false);
  });
});
