import { describe, expect, it, vi } from 'vitest';

import { isArrayPrefix } from '../isArrayPrefix';

describe('isArrayPrefix', () => {
  it('matches prefixes using SameValue comparison', () => {
    expect(isArrayPrefix([], ['a'])).toBe(true);
    expect(isArrayPrefix(['a'], ['a', 'b'])).toBe(true);
    expect(isArrayPrefix(['a', 'b'], ['a'])).toBe(false);
    expect(isArrayPrefix(['a', 'c'], ['a', 'b'])).toBe(false);
    expect(isArrayPrefix([NaN], [NaN])).toBe(true);
  });

  it('supports domain-specific equality', () => {
    const equals = vi.fn(
      (left: { id: number }, right: { id: number }) => left.id === right.id,
    );

    expect(isArrayPrefix([{ id: 1 }], [{ id: 1 }, { id: 2 }], equals)).toBe(
      true,
    );
    expect(equals).toHaveBeenCalledOnce();
  });
});
