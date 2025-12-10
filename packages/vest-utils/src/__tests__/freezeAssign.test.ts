import { describe, it, expect } from 'vitest';
import { freezeAssign } from '../freezeAssign';

describe('freezeAssign', () => {
  it('Should assign properties and freeze the object', () => {
    const target = {};
    const source = { a: 1 };
    const result = freezeAssign(target, source);

    expect(result).toEqual({ a: 1 });
    expect(Object.isFrozen(result)).toBe(true);
    expect(result).toBe(target); // assign modifies and returns target
  });

  it('Should handle multiple sources', () => {
    const result = freezeAssign<{ a: number; b: number }>(
      {},
      { a: 1 },
      { b: 2 },
    );
    expect(result).toEqual({ a: 1, b: 2 });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
