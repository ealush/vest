import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

const schema = enforce.shape({
  name: enforce.isString(),
  age: enforce.isNumeric().toNumber(),
});

function createSuite(seen: unknown[] = []) {
  return create((data: unknown) => {
    seen.push(data);
    test('name', () => true);
    test('age', () => true);
  }, schema);
}

describe('focused runs output the complete parsed data', () => {
  it('parses unfocused fields when the whole input passes', () => {
    const seen: unknown[] = [];
    const suite = createSuite(seen);
    suite.run({ name: 'Ann', age: '42' });

    const focused = suite.only('name').run({ name: 'Bob', age: '43' });
    expect(focused.valid).toBe(true);
    expect(focused.value).toEqual({ name: 'Bob', age: 43 });
    expect(suite.get().value).toEqual({ name: 'Bob', age: 43 });
    expect(seen.at(-1)).toEqual({ name: 'Bob', age: 43 });

    const skipped = suite
      .focus({ skip: 'name' })
      .run({ name: 'Cy', age: '44' });
    expect(skipped.value).toEqual({ name: 'Cy', age: 44 });
  });

  it('keeps best-effort output and focused reporting when an unfocused field fails', () => {
    const seen: unknown[] = [];
    const suite = createSuite(seen);
    suite.run({ name: 'Ann', age: '42' });

    const focused = suite
      .only('name')
      .run({ name: 'Bob', age: 'not a number' } as never);
    // The unfocused field keeps its previous verdict, as before.
    expect(focused.valid).toBe(true);
    expect(focused.hasErrors('age')).toBe(false);
    expect(focused.value).toEqual({ name: 'Bob', age: 'not a number' });
    expect(seen.at(-1)).toEqual({ name: 'Bob', age: 'not a number' });
  });

  it('passes the raw input when a focused field fails', () => {
    const seen: unknown[] = [];
    const suite = createSuite(seen);
    const focused = suite.only('age').run({ name: 1, age: 'x' } as never);
    expect(focused.valid).toBe(false);
    expect(seen.at(-1)).toEqual({ name: 1, age: 'x' });
  });
});
