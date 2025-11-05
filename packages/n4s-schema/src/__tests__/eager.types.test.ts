/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/ban-ts-comment */
import { enforce } from 'n4s-schema';

// Provide a trivial test so Vitest treats this file as a suite
import { describe, it, expect } from 'vitest';

// Wrap in a function so runtime won't execute; TypeScript still checks it.
function typeChecks() {
  // These should compile without errors
  const test1 = enforce(1).isNumber().greaterThan(0);
  const test2 = enforce('hello').isString().startsWith('h');
  const test3 = enforce([1, 2, 3]).isArray().includes(1);
  const test4 = enforce(true).isBoolean();

  // These should cause type errors
  // @ts-expect-error - greaterThan should not be available on boolean
  const test5 = enforce(true).greaterThan(5);

  // @ts-expect-error - startsWith should not be available on number
  const test6 = enforce(123).startsWith('1');

  // @ts-expect-error - includes should not be available on string
  const test7 = enforce('hello').includes('h');

  // After type guard, methods should be available
  const test8 = enforce(1).isNumber().greaterThan(0).isEven();
  const test9 = enforce('test').isString().longerThan(2).startsWith('t');

  // Type safety with unknown
  const unknownValue: unknown = 42;
  const test10 = enforce(unknownValue).isNumber().greaterThan(0);

  // Mixed types
  const test11 = enforce('42').isNumeric();
  const test12 = enforce('hello').lengthEquals(5);
  const test13 = enforce([1, 2]).lengthEquals(2);

  // avoid unused vars
  void [
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
    test7,
    test8,
    test9,
    test10,
    test11,
    test12,
    test13,
  ];
}

export {};

describe('types smoke', () => {
  it('compiles', () => {
    expect(true).toBe(true);
  });
});
// mark unused function as referenced for TS noUnusedLocals
void typeChecks;
