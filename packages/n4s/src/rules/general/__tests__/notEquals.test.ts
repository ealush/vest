import { describe, it, expect } from 'vitest';
import { notEquals } from '../notEquals';

describe('notEquals', () => {
  it('Should return true when values are not strictly equal', () => {
    expect(notEquals(1, 2)).toBe(true);
    expect(notEquals('a', 'b')).toBe(true);
    expect(notEquals({}, {})).toBe(true); // different references
  });

  it('Should return false when values are strictly equal', () => {
    expect(notEquals(1, 1)).toBe(false);
    expect(notEquals('a', 'a')).toBe(false);
    const obj = {};
    expect(notEquals(obj, obj)).toBe(false);
  });
});
