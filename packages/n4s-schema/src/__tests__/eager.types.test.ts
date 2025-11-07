/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/ban-ts-comment */
import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

// Provide a trivial test so Vitest treats this file as a suite

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

  // ===== COMPREHENSIVE TYPE GUARD SANITY TESTS =====

  // isString type guard - valid chains
  const str1 = enforce('hello').isString().startsWith('h');
  const str2 = enforce('hello').isString().endsWith('o');
  const str3 = enforce('hello').isString().matches(/^h/);
  const str4 = enforce('hello').isString().longerThan(3);
  const str5 = enforce('hello').isString().minLength(1);
  const str6 = enforce('hello').isString().isNotBlank();
  const strUnknown = enforce(unknownValue).isString().startsWith('x');

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const strChain1 = enforce('hello').isString().isNumber();
  const strChain2 = enforce('hello').isString().isBoolean();

  // isNumber type guard - valid chains
  const num1 = enforce(42).isNumber().greaterThan(0);
  const num2 = enforce(42).isNumber().lessThan(100);
  const num3 = enforce(42).isNumber().isEven();
  const num4 = enforce(42).isNumber().isPositive();
  const num5 = enforce(42).isNumber().isBetween(0, 100);
  const num6 = enforce(42).isNumber().isNotNaN();
  const numUnknown = enforce(unknownValue).isNumber().isPositive();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const numChain1 = enforce(42).isNumber().isString();
  const numChain2 = enforce(42).isNumber().isArray();

  // isBoolean type guard - valid chains
  const bool1 = enforce(true).isBoolean().isTrue();
  const bool2 = enforce(false).isBoolean().isFalse();
  const bool3 = enforce(true).isBoolean().isTruthy();
  const bool4 = enforce(false).isBoolean().isFalsy();
  const bool5 = enforce(true).isBoolean().equals(true);
  const boolUnknown = enforce(unknownValue).isBoolean().isTrue();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const boolChain1 = enforce(true).isBoolean().isNumber();
  const boolChain2 = enforce(true).isBoolean().isString();

  // isArray type guard - valid chains
  const arr1 = enforce([1, 2, 3]).isArray().includes(1);
  const arr2 = enforce([1, 2, 3]).isArray().minLength(1);
  const arr3 = enforce([1, 2, 3]).isArray().maxLength(10);
  const arr4 = enforce([1, 2, 3]).isArray().lengthEquals(3);
  const arr5 = enforce([1, 2, 3]).isArray().isEmpty();
  const arr6 = enforce([1, 2, 3]).isArray().longerThan(2);
  const arrUnknown = enforce(unknownValue).isArray().includes(1);

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const arrChain1 = enforce([1, 2]).isArray().isNumber();
  const arrChain2 = enforce([1, 2]).isArray().isString();

  // isNumeric type guard - valid chains
  const numeric1 = enforce('42').isNumeric().greaterThan(0);
  const numeric2 = enforce(42).isNumeric().lessThan(100);
  const numeric3 = enforce('42').isNumeric().isBetween(0, 100);
  const numeric4 = enforce('42').isNumeric().isPositive();
  const numeric5 = enforce('42').isNumeric().isEven();
  const numericUnknown = enforce(unknownValue).isNumeric().isPositive();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const numericChain1 = enforce('42').isNumeric().isBoolean();
  const numericChain2 = enforce('42').isNumeric().isArray();

  // isNull type guard - valid chains
  const null1 = enforce(null).isNull();
  const nullUnknown = enforce(unknownValue).isNull();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const nullChain1 = enforce(null).isNull().isNumber();
  const nullChain2 = enforce(null).isNull().isString();

  // isUndefined type guard - valid chains
  const undef1 = enforce(undefined).isUndefined();
  const undefUnknown = enforce(unknownValue).isUndefined();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const undefChain1 = enforce(undefined).isUndefined().isNumber();
  const undefChain2 = enforce(undefined).isUndefined().isBoolean();

  // isNullish type guard - valid chains
  const nullish1 = enforce(null).isNullish();
  const nullish2 = enforce(undefined).isNullish();
  const nullishUnknown = enforce(unknownValue).isNullish();

  // Type guards can be chained (will fail at runtime but allowed at compile time)
  const nullishChain1 = enforce(null).isNullish().isString();
  const nullishChain2 = enforce(undefined).isNullish().isNumber();

  // ===== CROSS TYPE GUARD TESTS =====

  // Type guards can be chained across types (runtime validation)
  const cross1 = enforce('hello').isString().isBoolean();
  const cross2 = enforce(true).isBoolean().isNumber();
  const cross3 = enforce(42).isNumber().isArray();
  const cross4 = enforce([1, 2]).isArray().isString();

  // ===== SCHEMA RULES TESTS =====

  // shape rule - valid
  const shape1 = enforce({ name: 'John', age: 30 }).shape({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // shape rule - should work after isObject type check (if we had one)
  const shapeUnknown = enforce(unknownValue as Record<string, any>).shape({
    name: enforce.isString(),
  });

  // optional rule - valid
  const opt1 = enforce('hello').optional(enforce.isString());
  const opt2 = enforce(undefined).optional(enforce.isString());
  const opt3 = enforce(42).optional(enforce.isNumber().greaterThan(0));

  // isArrayOf rule - valid
  const arrOf1 = enforce([1, 2, 3]).isArrayOf(enforce.isNumber());
  const arrOf2 = enforce(['a', 'b']).isArrayOf(enforce.isString());
  const arrOf3 = enforce([true, false]).isArrayOf(enforce.isBoolean());

  // loose rule - valid
  const loose1 = enforce({ name: 'John', age: 30, extra: 'data' }).loose({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // partial rule - valid
  const partial1 = enforce({ name: 'John' }).partial({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // ===== COMPOUND RULES TESTS =====

  // allOf rule - valid (must use type guards first for type-specific rules)
  const allOf1 = enforce(42).allOf(
    enforce.isNumber(),
    enforce.isNumber().greaterThan(0),
    enforce.isNumber().lessThan(100),
  );

  // anyOf rule - valid
  const anyOf1 = enforce('42').anyOf(enforce.isString(), enforce.isNumber());

  // noneOf rule - valid
  const noneOf1 = enforce(42).noneOf(enforce.isString(), enforce.isBoolean());

  // oneOf rule - valid
  const oneOf1 = enforce('hello').oneOf(enforce.isString(), enforce.isNumber());

  // ===== CHAINING WITH COMPOUND RULES =====

  // Type guards before compound rules - valid
  const compound1 = enforce('hello')
    .isString()
    .allOf(
      enforce.isString().startsWith('h'),
      enforce.isString().endsWith('o'),
    );

  const compound2 = enforce(42)
    .isNumber()
    .anyOf(enforce.isNumber().isEven(), enforce.isNumber().greaterThan(100));

  // Compound rules with type guards inside - valid
  const compound3 = enforce(unknownValue).allOf(
    enforce.isNumber(),
    enforce.isNumber().greaterThan(0),
  );

  // ===== COMPLEX CHAINING SCENARIOS =====

  // Multiple type guards in sequence (re-checking same type)
  const complex1 = enforce(42).isNumber().greaterThan(0).isNumber().isEven();

  // Type guard after schema rule
  const complex2 = enforce([1, 2, 3])
    .isArrayOf(enforce.isNumber())
    .minLength(1);

  // Chaining multiple validations on unknown
  const complex3 = enforce(unknownValue)
    .isNumber()
    .greaterThan(0)
    .lessThan(100)
    .isEven();

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
    str1,
    str2,
    str3,
    str4,
    str5,
    str6,
    strUnknown,
    strChain1,
    strChain2,
    num1,
    num2,
    num3,
    num4,
    num5,
    num6,
    numUnknown,
    numChain1,
    numChain2,
    bool1,
    bool2,
    bool3,
    bool4,
    bool5,
    boolUnknown,
    boolChain1,
    boolChain2,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    arr6,
    arrUnknown,
    arrChain1,
    arrChain2,
    numeric1,
    numeric2,
    numeric3,
    numeric4,
    numeric5,
    numericUnknown,
    numericChain1,
    numericChain2,
    null1,
    nullUnknown,
    nullChain1,
    nullChain2,
    undef1,
    undefUnknown,
    undefChain1,
    undefChain2,
    nullish1,
    nullish2,
    nullishUnknown,
    nullishChain1,
    nullishChain2,
    cross1,
    cross2,
    cross3,
    cross4,
    shape1,
    shapeUnknown,
    opt1,
    opt2,
    opt3,
    arrOf1,
    arrOf2,
    arrOf3,
    loose1,
    partial1,
    allOf1,
    anyOf1,
    noneOf1,
    oneOf1,
    compound1,
    compound2,
    compound3,
    complex1,
    complex2,
    complex3,
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
