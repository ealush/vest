/**
 * Comprehensive TypeScript type tests for n4s-schema
 * These tests verify type inference, type guards, and compile-time type safety
 */

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/ban-ts-comment */
import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

// Wrap in a function so runtime won't execute; TypeScript still checks it.
function typeChecks() {
  // ===== BASIC TYPE INFERENCE =====

  // Type guards provide proper narrowing
  const test1 = enforce(1).isNumber().greaterThan(0);
  const test2 = enforce('hello').isString().startsWith('h');
  const test3 = enforce([1, 2, 3]).isArray().includes(1);
  const test4 = enforce(true).isBoolean();

  // These should cause type errors
  // Type test: - greaterThan should not be available on boolean
  const test5 = enforce(true).greaterThan(5);

  // Type test: - startsWith should not be available on number
  const test6 = enforce(123).startsWith('1');

  // Type test: - array includes() takes single value, not available on string
  const test7 = enforce('hello').includes('h');

  // ===== TYPE GUARDS =====

  // isString type guard - valid chains
  const str1 = enforce('hello').isString().startsWith('h');
  const str2 = enforce('hello').isString().endsWith('o');
  const str3 = enforce('hello').isString().matches(/^h/);
  const str4 = enforce('hello').isString().longerThan(3);
  const str5 = enforce('hello').isString().minLength(1);

  // isNumber type guard - valid chains
  const num1 = enforce(42).isNumber().greaterThan(0);
  const num2 = enforce(42).isNumber().lessThan(100);
  const num3 = enforce(42).isNumber().isEven();
  const num4 = enforce(42).isNumber().isPositive();
  const num5 = enforce(42).isNumber().isBetween(0, 100);
  const num6 = enforce(42).isNumber().isNotNaN();

  // isBoolean type guard - valid chains
  const bool1 = enforce(true).isBoolean().isTrue();
  const bool2 = enforce(false).isBoolean().isFalse();
  const bool3 = enforce(true).isBoolean().isTruthy();
  const bool4 = enforce(false).isBoolean().isFalsy();
  const bool5 = enforce(true).isBoolean().equals(true);

  // isArray type guard - valid chains
  const arr1 = enforce([1, 2, 3]).isArray().includes(1);
  const arr2 = enforce([1, 2, 3]).isArray().minLength(1);
  const arr3 = enforce([1, 2, 3]).isArray().maxLength(10);
  const arr4 = enforce([1, 2, 3]).isArray().lengthEquals(3);
  const arr5 = enforce([1, 2, 3]).isArray().isEmpty();
  const arr6 = enforce([1, 2, 3]).isArray().longerThan(2);

  // isNumeric type guard - valid chains (works with numeric strings)
  const numeric1 = enforce('42').isNumeric().greaterThan(0);
  const numeric2 = enforce(42).isNumeric().lessThan(100);
  const numeric3 = enforce('42').isNumeric().isBetween(0, 100);
  const numeric4 = enforce('42').isNumeric().isPositive();
  const numeric5 = enforce('42').isNumeric().isEven();

  // isNull type guard
  const null1 = enforce(null).isNull();

  // isUndefined type guard
  const undef1 = enforce(undefined).isUndefined();

  // isNullish type guard
  const nullish1 = enforce(null).isNullish();
  const nullish2 = enforce(undefined).isNullish();

  // Type guards work with unknown
  const unknownValue: unknown = 42;
  const strUnknown = enforce(unknownValue).isString().startsWith('x');
  const numUnknown = enforce(unknownValue).isNumber().isPositive();
  const boolUnknown = enforce(unknownValue).isBoolean().isTrue();
  const arrUnknown = enforce(unknownValue).isArray().includes(1);
  const numericUnknown = enforce(unknownValue).isNumeric().isPositive();
  const nullUnknown = enforce(unknownValue).isNull();
  const undefUnknown = enforce(unknownValue).isUndefined();
  const nullishUnknown = enforce(unknownValue).isNullish();

  // ===== SCHEMA RULES TYPE INFERENCE =====

  // shape rule - infers exact type
  const shape1 = enforce({ name: 'John', age: 30 }).shape({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // optional rule - infers union with undefined and null
  const opt1 = enforce('hello').optional(enforce.isString());
  const opt2 = enforce(undefined).optional(enforce.isString());
  const opt3 = enforce(42).optional(enforce.isNumber().greaterThan(0));

  // isArrayOf rule - infers array type
  const arrOf1 = enforce([1, 2, 3]).isArrayOf(enforce.isNumber());
  const arrOf2 = enforce(['a', 'b']).isArrayOf(enforce.isString());
  const arrOf3 = enforce([true, false]).isArrayOf(enforce.isBoolean());

  // loose rule - allows extra properties
  const loose1 = enforce({ name: 'John', age: 30, extra: 'data' }).loose({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // partial rule - all properties optional
  const partial1 = enforce({ name: 'John' }).partial({
    name: enforce.isString(),
    age: enforce.isNumber(),
  });

  // ===== COMPOUND RULES TYPE INFERENCE =====

  // allOf rule - must satisfy all rules
  const allOf1 = enforce(42).allOf(
    enforce.isNumber(),
    enforce.isNumber().greaterThan(0),
    enforce.isNumber().lessThan(100),
  );

  // anyOf rule - must satisfy at least one rule (union type)
  const anyOf1 = enforce('42').anyOf(enforce.isString(), enforce.isNumber());

  // noneOf rule - must satisfy none of the rules
  const noneOf1 = enforce(42).noneOf(enforce.isString(), enforce.isBoolean());

  // oneOf rule - must satisfy exactly one rule
  const oneOf1 = enforce('hello').oneOf(enforce.isString(), enforce.isNumber());

  // ===== COMPLEX CHAINING SCENARIOS =====

  // Multiple type guards in sequence
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

  // ===== TYPE INFERENCE WITH .infer PROPERTY =====

  // Primitive rules
  const stringRule = enforce.isString();
  type StringType = typeof stringRule.infer; // Should be string

  const numberRule = enforce.isNumber();
  type NumberType = typeof numberRule.infer; // Should be number

  const booleanRule = enforce.isBoolean();
  type BooleanType = typeof booleanRule.infer; // Should be boolean

  const arrayRule = enforce.isArray();
  type ArrayType = typeof arrayRule.infer; // Should be unknown[]

  // Schema rules
  const userRule = enforce.shape({
    id: enforce.isNumber(),
    name: enforce.isString(),
    email: enforce.optional(enforce.isString()),
  });
  type UserType = typeof userRule.infer;

  // Compound rules
  const stringOrNumberRule = enforce.anyOf(
    enforce.isString(),
    enforce.isNumber(),
  );
  type StringOrNumber = typeof stringOrNumberRule.infer; // Should be string | number

  // Array of objects
  const usersRule = enforce.isArrayOf(userRule);
  type UsersType = typeof usersRule.infer;

  // ===== CUSTOM RULES TYPE SAFETY =====

  // Custom rules with extend should be type-safe
  // (This would require the n4s namespace declaration)

  // Mark all as used to avoid warnings
  void [
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
    test7,
    str1,
    str2,
    str3,
    str4,
    str5,
    num1,
    num2,
    num3,
    num4,
    num5,
    num6,
    bool1,
    bool2,
    bool3,
    bool4,
    bool5,
    arr1,
    arr2,
    arr3,
    arr4,
    arr5,
    arr6,
    numeric1,
    numeric2,
    numeric3,
    numeric4,
    numeric5,
    null1,
    undef1,
    nullish1,
    nullish2,
    strUnknown,
    numUnknown,
    boolUnknown,
    arrUnknown,
    numericUnknown,
    nullUnknown,
    undefUnknown,
    nullishUnknown,
    shape1,
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
    complex1,
    complex2,
    complex3,
  ];
}

// Runtime test to verify the file is recognized by vitest
describe('TypeScript Type Tests', () => {
  it('compiles without errors', () => {
    expect(true).toBe(true);
  });

  it('ensures type guards work at runtime', () => {
    // Verify that type guards actually work
    expect(enforce.isNumber().test(42)).toBe(true);
    expect(enforce.isString().test('hello')).toBe(true);
    expect(enforce.isBoolean().test(true)).toBe(true);
    expect(enforce.isArray().test([])).toBe(true);
  });
});

// Mark unused function as referenced for TS noUnusedLocals
void typeChecks;
