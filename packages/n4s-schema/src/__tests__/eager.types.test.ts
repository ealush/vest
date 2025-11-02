import { enforce } from 'eager';

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

export {};
