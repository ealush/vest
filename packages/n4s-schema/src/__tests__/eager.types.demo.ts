// Type Safety Demo for enforce() API
// This file demonstrates the type safety features

import { enforce } from '../eager';

// ✅ Valid: Number with number rules
function testNumberRules() {
  enforce(42).isNumber().greaterThan(0).lessThan(100).isEven();
  enforce(10).greaterThanOrEquals(5).lessThanOrEquals(20);
  enforce(-5).isNegative();
  enforce(5).isPositive();
  enforce(7).isOdd();
}

// ✅ Valid: String with string rules
function testStringRules() {
  enforce('hello').isString().startsWith('h').endsWith('o');
  enforce('test@example.com').matches(/@/);
  enforce('world').doesNotStartWith('hello');
  enforce('   ').isBlank();
  enforce('text').isNotBlank();
}

// ✅ Valid: Boolean with boolean rules
function testBooleanRules() {
  enforce(true).isBoolean();
  enforce(false).isBoolean();
}

// ✅ Valid: Array with array rules
function testArrayRules() {
  const arr = [1, 2, 3];
  enforce(arr).isArray().includes(2);
}

// ✅ Valid: Length rules on strings and arrays
function testLengthRules() {
  enforce('hello').lengthEquals(5).longerThan(3);
  const arr: string[] = ['a', 'b'];
  enforce(arr).minLength(1).maxLength(10);
}

// ✅ Valid: Type guards narrow the type
function testTypeGuards() {
  const value: unknown = 42;
  // After casting or checking, can use type-specific rules
  if (typeof value === 'number') {
    enforce(value).isNumber().greaterThan(0);
  }

  if (typeof value === 'string') {
    enforce(value).isString().startsWith('test');
  }
}

// ✅ Valid: Chaining after type assertions
function testChaining() {
  enforce(100).isNumber().greaterThan(50).isEven().isPositive();
  enforce('testing').isString().longerThan(5).matches(/test/).isNotBlank();
}

export {};
