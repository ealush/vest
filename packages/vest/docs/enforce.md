# Enforce

For assertions, Vest is bundled with [Enforce](https://npmjs.com/package/n4s). Enforce is a validation assertion library. It allows you to run your data against rules and conditions and test whether it passes your validations. It is intended for validation logic that gets repeated over and over again and should not be written manually. It comes with a wide variety of pre-built rules, but it can also be extended to support your own repeated custom logic.

The way Enforce operates is similar to most common assertion libraries. You pass it a value, and one or more rules to test your value against - if the validation fails, it throws an Error, otherwise - it will move on to the next rule in the chain.

```js
import { enforce } from 'vest';

enforce(4).isNumber();
// passes

enforce(4).isNumber().greaterThan(2);
// passes

enforce(4)
  .lessThan(2) // throws an error, will not carry on to the next rule
  .greaterThan(3);
```

## Content

- [List of Enforce rules](#list-of-enforce-rules) - All default enforce rules
- [Custom Enforce Rules](#custom-enforce-rules) - How to extend enforce with your rules
- [Shape (schema) validation](#shape-validations) - Validating she shape of an object
- [Business Related Rules](#business-related-rules) - Using more rules such as isEmail and isCreditCard

Enforce exposes all predefined and custom rules. You may use chaining to make multiple enfocements for the same value.

## List of Enforce rules

Enforce rules are functions that allow you to test your data against different criteria. The following rules are supported out-of-the-box.

- [equals](#equals)
- [notEquals](#notequals)
- [isEmpty](#isempty)
- [isNotEmpty](#isnotempty)
- [isNumeric](#isnumeric)
- [isNotNumeric](#isnotnumeric)
- [greaterThan](#greaterthan)
- [greaterThanOrEquals](#greaterthanorequals)
- [lengthEquals](#lengthequals)
- [lengthNotEquals](#lengthnotequals)
- [lessThan](#lessthan)
- [lessThanOrEquals](#lessthanorequals)
- [longerThan](#longerthan)
- [longerThanOrEquals](#longerthanorequals)
- [numberEquals](#numberequals)
- [numberNotEquals](#numbernotequals)
- [shorterThan](#shorterthan)
- [shorterThanOrEquals](#shorterthanorequals)
- [matches](#matches)
- [notMatches](#notmatches)
- [inside](#inside)
- [notInside](#notinside)
- [isTruthy](#istruthy)
- [isFalsy](#isfalsy)
- [isArray](#isarray)
- [isNotArray](#isnotarray)
- [isNumber](#isnumber)
- [isNotNumber](#isnotnumber)
- [isNaN](#isNaN)
- [isNotNaN](#isNotNaN)
- [isNull](#isnull)
- [isNotNull](#isnotnull)
- [isString](#isstring)
- [isNotString](#isnotstring)
- [isUndefined](#isundefined)
- [isOdd](#isodd)
- [isEven](#iseven)
- [isBetween](#isbetween)
- [isNotBetween](#isnotbetween)
- [endsWith](#endswith)
- [doesNotEndWith](#doesnotendwith)
- [startsWith](#startsWith)
- [doesNotStartWith](#doesnotstartwith)
- [isNegative](#isnegative)
- [isPositive](#ispositive)

### equals

#### Description

Checks if your enforced value <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Strict_equality_using" target="_blank">strictly equals</a> (`===`) another.

It is not recommended to use this rule to compare arrays or objects, as it does not perform any sort of deep comparison on the value.

For numeric value comparison, you should use `numberEquals`, which coerces numeric strings into numbers before comparing.

#### Arguments

- `value`: Any value you wish to check your enforced value against

#### Usage examples:

```js
enforce(1).equals(1);

enforce('hello').equals('hello');

const a = [1, 2, 3];

enforce(a).equals(a);
// passes
```

```js
enforce('1').equals(1);
enforce([1, 2, 3]).equals([1, 2, 3]);
// throws
```

### notEquals

#### Description

Checks if your enforced value does not <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Strict_equality_using" target="_blank">strictly equal</a> (`===`) another.

Reverse implementation of `equals`.

#### Usage examples:

```js
enforce('1').notEquals(1);
enforce([1, 2, 3]).notEquals([1, 2, 3]);
// passes
```

```js
enforce(1).notEquals(1);
enforce('hello').notEquals('hello');

const a = [1, 2, 3];

enforce(a).notEquals(a);
// throws
```

### isEmpty

#### Description

Checks if your enforced value is empty, false, zero, null or undefined.

Expected results are:

- object: checks against the count of keys (`0` is empty)
- array/string: checks against length. (`0` is empty)
- number: checks the value of the number. (`0` and `NaN` are empty)
- boolean: `false` is empty.
- undefined/null: are both empty.

#### Usage examples:

```js
enforce([]).isEmpty();
enforce('').isEmpty();
enforce({}).isEmpty();
enforce(0).isEmpty();
enforce(NaN).isEmpty();
enforce(undefined).isEmpty();
enforce(null).isEmpty();
enforce(false).isEmpty();
// passes
```

```js
enforce([1]).isEmpty();
enforce('1').isEmpty();
enforce({ 1: 1 }).isEmpty();
enforce(1).isEmpty();
enforce(true).isEmpty();
// throws
```

### isNotEmpty

#### Description

Checks that your enforced value is not empty, false, or zero.
Reverse implementation of `isEmpty`.

#### Usage examples:

```js
enforce([1]).isNotEmpty();
enforce('1').isNotEmpty();
enforce({ 1: 1 }).isNotEmpty();
// passes
```

```js
enforce([]).isNotEmpty();
enforce('').isNotEmpty();
enforce({}).isNotEmpty();
enforce(0).isNotEmpty();
// throws
```

### isNumeric

#### Description

Checks if a value is a representation of a real number

#### Usage examples:

```js
enforce(143).isNumeric();
enforce('143').isNumeric();
// passes
```

```js
enforce(NaN).isNumeric();
enforce('1hello').isNumeric();
enforce('hi').isNumeric();
// throws
```

### isNotNumeric

#### Description

Checks if a value is not a representation of a real number.
Reverse implementation of `isNumeric`.

#### Usage examples:

```js
enforce(NaN).isNotNumeric();
enforce('Hello World!').isNotNumeric();
// passes
```

```js
enforce(731).isNotNumeric();
enforce('42').isNotNumeric();
// throws
```

### greaterThan

- alias: `gt`

#### Description

Checks that your numeric enforced value is larger than a given numeric value.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(1).greaterThan(0);
enforce('10').greaterThan(0);
enforce(900).gt('100');
// passes
```

```js
enforce(100).greaterThan(100);
enforce('100').greaterThan(110);
enforce([100]).gt(1);
// throws
```

### greaterThanOrEquals

- alias: `gte()`

#### Description

Checks that your numeric enforced value is larger than or equals to a given numeric value.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(1).greaterThanOrEquals(0);
enforce('10').greaterThanOrEquals(0);
enforce(900).greaterThanOrEquals('100');
enforce(100).greaterThanOrEquals('100');
enforce(900).gte('900');
enforce('1337').gte(1337);
// passes
```

```js
enforce(100).greaterThanOrEquals('120');
enforce('100').greaterThanOrEquals(110);
enforce([100]).gte(1);
// throws
```

### lengthEquals

#### Description

Checks that your enforced value is equal to the given number.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

```js
enforce([1]).lengthEquals(1);
enforce('a').lengthEquals(1);
// passes
```

```js
enforce([1, 2]).lengthEquals(1);
enforce('').lengthEquals(1);
// throws
```

### lengthNotEquals

#### Description

Checks that your enforced value is not equal to the given number.
Reverse implementation of `lengthEquals`.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

```js
enforce([1]).lengthNotEquals(0);
enforce('a').lengthNotEquals(3);
// passes
```

```js
enforce([1]).lengthNotEquals(1);
enforce('').lengthNotEquals(0);
// throws
```

### lessThan

- alias: `lt()`

#### Description

Checks that your numeric enforced value is smaller than a given numeric value.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(0).lessThan(1);
enforce(2).lessThan('10');
enforce('90').lt(100);
// passes
```

```js
enforce(100).lessThan(100);
enforce('110').lessThan(100);
enforce([0]).lt(1);
// throws
```

### lessThanOrEquals

- alias: `lte()`

#### Description

Checks that your numeric enforced value is smaller than or equals to a given numeric value.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(0).lessThanOrEquals(1);
enforce(2).lessThanOrEquals('10');
enforce('90').lte(100);
enforce(100).lte('100');
// passes
```

```js
enforce(100).lessThanOrEquals(90);
enforce('110').lessThanOrEquals(100);
enforce([0]).lte(1);
// throws
```

### longerThan

#### Description

Checks that your enforced value is longer than a given number.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

```js
enforce([1]).longerThan(0);
enforce('ab').longerThan(1);
// passes
```

```js
enforce([1]).longerThan(2);
enforce('').longerThan(0);
// throws
```

### longerThanOrEquals

#### Description

Checks that your enforced value is longer than or equals to a given number.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

```js
enforce([1]).longerThanOrEquals(0);
enforce('ab').longerThanOrEquals(1);
enforce([1]).longerThanOrEquals(1);
enforce('a').longerThanOrEquals(1);
// passes
```

```js
enforce([1]).longerThanOrEquals(2);
enforce('').longerThanOrEquals(1);
// throws
```

### numberEquals

#### Description

Checks that your numeric enforced value is equals another value.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(0).numberEquals(0);
enforce(2).numberEquals('2');
// passes
```

```js
enforce(100).numberEquals(10);
enforce('110').numberEquals(100);
enforce([0]).numberEquals(1);
// throws
```

### numberNotEquals

#### Description

Checks that your numeric enforced value does not equal another value.
Reverse implementation of `numberEquals`.

#### Arguments

- `value`: `number | string` | A numeric value against which you want to check your enforced value.

Strings are parsed using `Number()`, values which are not fully numeric always return false;

#### Usage

```js
enforce(2).numberNotEquals(0);
enforce('11').numberNotEquals('10');
// passes
```

```js
enforce(100).numberNotEquals(100);
enforce('110').numberNotEquals(100);
// throws
```

### shorterThan

#### Description

Checks that your enforced value is shorter than a given number.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

```js
enforce([]).shorterThan(1);
enforce('a').shorterThan(2);
// passes
```

```js
enforce([1]).shorterThan(0);
enforce('').shorterThan(0);
// throws
```

### shorterThanOrEquals

#### Description

Checks that your enforced value is shorter than or equals to a given number.

#### Arguments

- `size`: `number` | the number which you would like your initial value to be tested against.

The `value` argument can be of the following types:

- array: checks against length.
- string: checks against length.

#### Usage examples:

##### Passing examples:

```js
enforce([]).shorterThanOrEquals(1);
enforce('a').shorterThanOrEquals(2);
enforce([]).shorterThanOrEquals(0);
enforce('a').shorterThanOrEquals(1);
// passes
```

```js
enforce([1]).shorterThanOrEquals(0);
enforce('ab').shorterThanOrEquals(1);
// throws
```

### matches

#### Description

Checks if a value contains a regex match.

#### Arguments

- `regexp`: either a `RegExp` object, or a RegExp valid string

#### Usage examples:

```js
enforce(1984).matches(/[0-9]/);
enforce(1984).matches('[0-9]');
enforce('1984').matches(/[0-9]/);
enforce('1984').matches('[0-9]');
enforce('198four').matches(/[0-9]/);
enforce('198four').matches('[0-9]');
// passes
```

```js
enforce('ninety eighty four').matches(/[0-9]/);
enforce('ninety eighty four').matches('[0-9]');
// throws
```

### notMatches

#### Description

Checks if a value does not contain a regex match.
Reverse implementation of `matches`.

#### Usage examples:

```js
enforce(1984).notMatches(/[0-9]/);
// throws
```

```js
enforce('ninety eighty four').notMatches('[0-9]');
// passes
```

### inside

#### Description

Checks if your enforced value is contained in another array or string.
Your enforced value can be of the following types:

- `string`
- `number`
- `boolean`

#### Arguments

- `container`: a `string` or an `array` which may contain the value specified.

#### Usage examples:

##### inside: array

Checks for membership in an array.

- string: checks if a string is an element in an array

```js
enforce('hello').inside(['hello', 'world']);
// passes
```

```js
enforce('hello!').inside(['hello', 'world']);
// throws
```

- number: checks if a number is an element in an array

```js
enforce(1).inside([1, 2]);
// passes
```

```js
enforce(3).inside([1, 2]);
// throws
```

- boolean: checks if a number is an element in an array

```js
enforce(false).inside([true, false]);
// passes
```

```js
enforce(true).inside([1, 2, 3]);
// throws
```

##### inside: string

- string: checks if a string is inside another string

```js
enforce('da').inside('tru dat.');
// passes
```

```js
enforce('ad').inside('tru dat.');
// throws
```

### notInside

#### Description

Checks if a given value is not contained in another array or string.
Reverse implementation of `inside`.

#### Usage examples:

```js
enforce('ad').notInside('tru dat.');
enforce('hello!').notInside(['hello', 'world']);
// passes
```

```js
enforce('hello').notInside(['hello', 'world']);
enforce('da').notInside('tru dat.');
// throws
```

### isTruthy

#### Description

Checks if a value is truthy; Meaning: if it can be coerced into boolean `true`.
Anything not in the following list is considered to be truthy.

- `undefined`
- `null`
- `false`
- `0`
- `NaN`
- empty string (`""`)

#### Usage examples:

```js
enforce('hello').isTruthy();
enforce(true).isTruthy();
enforce(1).isTruthy();
// passes
```

```js
enforce(false).isTruthy();
enforce(null).isTruthy();
enforce(undefined).isTruthy();
enforce(0).isTruthy();
enforce(NaN).isTruthy();
enforce('').isTruthy();
// throws
```

### isFalsy

#### Description

Checks if a value is falsy; Meaning: if it can be coerced into boolean `false`.
Reverse implementation of `isTruthy`.

Anything not in the following list is considered to be truthy:

- `undefined`
- `null`
- `false`
- `0`
- `NaN`
- empty string (`""`)

#### Usage examples:

```js
enforce(false).isFalsy();
enforce(0).isFalsy();
enforce(undefined).isFalsy();
// passes
```

```js
enforce(1).isFalsy();
enforce(true).isFalsy();
enforce('hi').isFalsy();
// throws
```

### isArray

#### Description

Checks if a value is of type `Array`.

#### Usage examples:

```js
enforce(['hello']).isArray();
// passes
```

```js
enforce('hello').isArray();
// throws
```

### isNotArray

#### Description

Checks if a value is of any type other than `Array`.
Reverse implementation of `isArray`.

#### Usage examples:

```js
enforce(['hello']).isNotArray();
// throws
```

```js
enforce('hello').isNotArray();
// passes
```

### isNumber

#### Description

Checks if a value is of type `number`.
Equals to `typeof value === 'number'`

#### Usage examples:

```js
enforce(143).isNumber();
enforce(NaN).isNumber(); // (NaN is of type 'number!')
// passes
```

```js
enforce([]).isNumber();
enforce('143').isNumber();
// throws
```

### isNotNumber

#### Description

Checks if a value is of any type other than `number`.
Reverse implementation of `isNumber`.

**note** isNotNumber does not check for `NaN` value. For NaN values, use [isNaN](#isNaN).

#### Usage examples:

```js
enforce('143').isNotNumber();
enforce(143).isNotNumber();
// passes
```

```js
enforce(143).isNotNumber();
enforce(NaN).isNotNumber(); // throws (NaN is of type 'number!')
// throws
```

### isNaN

#### Description

A wrapper around JavaScripts Number.isNaN() function. Checks if a value is NaN.

#### Usage examples:

```js
enforce(NaN).isNaN();
enforce('A' / 'B').isNaN();
// passes
```

```js
enforce(null * null).isNaN(); // null*null = 0
enforce(200).isNaN();
enforce('1984').isNaN();
// throws
```

### isNotNaN

#### Description

Reverse implementation of `isNaN`. Checks that a value is not NaN.

#### Usage examples:

```js
enforce(null * null).isNaN(); // null*null = 0
enforce(200).isNaN();
enforce('1984').isNaN();
// passes
```

```js
enforce(NaN).isNaN();
enforce('A' / 'B').isNaN();
// throws
```

### isNull

#### Description

Enforces that a specified value is `null`.

#### Usage examples:

```js
enforce(null).isNull();
// passes
```

```js
enforce(undefined).isNull();
enforce(true).isNull();
// throws
```

### isNotNull

#### Description

Reverse implementation of `isNull`. Checks that a value is not null.

#### Usage examples:

```js
enforce('hello').isNull();
enforce(200).isNull();
// passes
```

```js
enforce(null).isNull();
// throws
```

### isString

#### Description

Checks if a value is of type `String`.

#### Usage examples:

```js
enforce('hello').isString();
// passes
```

```js
enforce(['hello']).isString();
enforce(1984).isString();
// throws
```

### isNotString

#### Description

Checks if a value is of any type other than `String`.
Reverse implementation of `isString`.

#### Usage examples:

```js
enforce('hello').isNotString();
// throws
```

```js
enforce(['hello']).isNotString();
// passes
```

### isUndefined

#### Description

Enforces that a given value is (`===`) undefined.

#### Usage examples:

```js
enforce().isUndefined();
enforce(undefined).isUndefined();
// passes
```

```js
enforce(null).isUndefined();
enforce(true).isUndefined();
// throws
```

### isOdd

#### Description

Checks if a value is an odd numeric value.

#### Usage examples:

```js
enforce('1').isOdd();
enforce(9).isOdd();
// passes
```

```js
enforce(2).isOdd();
enforce('4').isOdd();
enforce('1withNumber').isOdd();
enforce([1]).isOdd();
// throws
```

### isEven

#### Description

Checks if a value is an even numeric value.

#### Usage examples:

```js
enforce(0).isEven();
enforce('2').isEven();
// passes
```

```js
enforce(1).isEven();
enforce('3').isEven();
enforce('2withNumber').isEven();
enforce([0]).isEven();
// throws
```

### isBetween

#### Description

Checks if a number is in range of two numbers (edges of range included)

#### Usage examples:

```js
enforce(5).isBetween(0, 5);
enforce(5).isBetween(0, 10);
enforce(-5).isBetween(-10, -1);
enforce(-5.5).isBetween(-10, -1);
enforce(-5.5).isBetween(-10, -1.1);
enforce(-5.5).isBetween(-9.5, -1.1);
// passes
```

```js
enforce(5).isBetween(0, 2);
enforce(-5).isBetween(0, 2);
enforce('some_string').isBetween(0, 2);
enforce(false).isBetween(0, 2);
// throws
```

### isNotBetween

#### Description

Checks if a number **is not** in range of two numbers (edges of range excluded)

#### Usage examples:

```js
enforce(5).isNotBetween(0, 4);
enforce(5).isNotBetween(0, 10);
enforce(-5).isNotBetween(-10, -1);
enforce(-5.5).isNotBetween(-10, -1);
enforce(-5.5).isNotBetween(-10, -1.1);
// passes
```

```js
enforce(5).isNotBetween(0, 5);
enforce(5).isNotBetween(0, 10);
enforce(-5).isNotBetween(-10, -1);
enforce(-5).isNotBetween(-5, -1);
enforce('some_string').isNotBetween(0, 2);
enforce(false).isNotBetween(0, 2);
// throws
```

### endsWith

#### Description

Determines whether a string ends with the characters of a specified string.

#### Usage examples:

```js
enforce('aba').endsWith('ba');
enforce('some_string').endsWith('_string');
enforce('string with spaces').endsWith('ng with spaces');
enforce('aaaa     ').endsWith(' ');
// passes
```

```js
enforce('for').endsWith('tor');
enforce('aaaab').endsWith('aaaa');
enforce('aa').endsWith('aaa');
enforce(42).endsWith('b');
enforce(42).endsWith(50);
enforce(true).endsWith(100);
// throws
```

### doesNotEndWith

#### Description

Determines whether a string does not end with the characters of a specified string.
Reverse implementation of `endsWith`.

### startsWith

#### Description

Determines whether a string starts with the characters of a specified string.

#### Usage examples:

```js
enforce('aba').startsWith('ab');
enforce('some_string').startsWith('some_');
enforce('string with spaces').startsWith('string with s');
enforce('aaaa     ').startsWith('aaaa ');
// passes
```

```js
enforce('for').startsWith('tor');
enforce('aaaab').startsWith('aab');
enforce('aa').startsWith('aaa');
enforce(42).startsWith('b');
enforce(42).startsWith(50);
enforce(true).startsWith(100);
// throws
```

### doesNotStartWith

#### Description

Determines whether a string does not start with the characters of a specified string.
Reverse implementation of `startsWith`.

#### Usage examples:

```js
enforce('for').doesNotStartWith('tor');
enforce('aaaab').doesNotStartWith('aab');
enforce('aa').doesNotStartWith('aaa');
enforce(42).doesNotStartWith('b');
enforce(42).doesNotStartWith(50);
enforce(true).doesNotStartWith(100);
// passes
```

```js
enforce('aba').doesNotStartWith('ab');
enforce('some_string').doesNotStartWith('some_');
enforce('string with spaces').doesNotStartWith('string with s');
enforce('aaaa     ').doesNotStartWith('aaaa ');
// throws
```

### isNegative

#### Description

Determines whether a numeric value is negative or not.

#### Usage examples:

```js
enforce(-10).isNegative(); //passes
enforce(-10.12).isNegative(); //passes
enforce('-10.12').isNegative(); //passes
enforce(10).isNegative(); // throws
enforce('10').isNegative(); // throws
```

### isPositive

#### Description

Determines whether a numeric value is positive or not.

#### Usage examples:

```js
enforce(10).isPositive(); //passes
enforce(10.12).isPositive(); //passes
enforce('10.12').isPositive(); //passes
enforce(-10).isPositive(); // throws
enforce('-10.12').isPositive(); // throws
```

## Custom enforce rules

To make it easier to reuse logic across your application, sometimes you would want to encapsulate bits of logic in rules that you can use later on, for example, "what's considered a valid email".

Rules are called with the argument passed to enforce(x) followed by the arguments passed to `.yourRule(y, z)`.

```js
enforce.extend({
  yourRule(x, y, z) {
    return {
      pass: true,
      message: () => '',
    };
  },
});
```

```js
enforce.extend({
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, key) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
});

enforce(user.email).isValidEmail();
```

### Custom rules return value

Rules can either return boolean indicating success or failure, or an object with two keys. `pass` indicates whether the validation is successful or not, and message provides a function with no arguments that return an error message in case of failure. Thus, when pass is false, message should return the error message for when enforce(x).yourRule() fails.

```js
enforce.extend({
  isWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

## Shape validations

Enforce comes with a built-in lean schema validator rule called `shape`. It allows you to use all the existing and custom rules of enforce to validate the shape of an object.

When using enforce rules inside your shape, use the rules that exist as properties on enforce itself (`enforce.isString()`).

### Example

```js
enforce({
  firstName: 'Rick',
  lastName: 'Sanchez',
  age: 70,
}).shape({
  firstName: enforce.isString(),
  lastName: enforce.isString(),
  age: enforce.isNumber(),
});
```

### Testing multiple rules for the same key

To test multiple rules with the same key use an array of rules:

```js
enforce({
  age: 22,
}).shape({
  age: [enforce.isNumber(), enforce.isBetween(0, 150)],
});
```

### Deeply nested data objects:

To deeply nest shape calls, just use them as any other rules inside shape:

```js
enforce({
  user: {
    name: {
      first: 'Joseph',
      last: 'Weil',
    },
  },
}).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString(),
    }),
  }),
});
```

### Marking a field as optional

In regular cases, a missing key in the data object would cause an error to be thrown. To prevent that from happening, mark your optional keys with `enforce.optional`.

enforce.optional will pass a key that's either not defined, undefined or null.

`enforce.optional` takes as its arguments all the rules that the value should pass - only if it is present. If it is not present in the data object.

```js
enforce({
  user: {
    name: {
      first: 'Joseph',
      last: 'Weil',
    },
  },
}).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString(),
      middle: enforce.optional(enforce.isString(), enforce.longerThan(3)),
    }),
  }),
});
```

# Business Related Rules

Along with the existing rules, you might need different business related rules, for email, phone number, credit card validations, and more.

Enforce uses [validator.js](https://github.com/validatorjs/validator.js) to provide some of these validations.

## Validator.js validations currently provided:

- isAlphanumeric
- isCreditCard
- isCurrency
- isEmail
- isIP
- isIdentityCard
- isJSON
- isLocale
- isMimeType
- isMobilePhone
- isPassportNumber
- isPostalCode
- isURL

Because these rules are business specific, and can have an impact on your bundle size, they are split into a their own bundle.

For example:

```js
import enforce from 'vest/enforceExtended';

enforce('example@gmail.com').isEmail();
```

Some of these rules also require locale arrays and objects. These are also exported by the extended entry point:

```js
import enforce, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
} from 'vest/enforceExtended';
```

To read the full documentation on these rules and the options they take, please visit [validator.js](https://github.com/validatorjs/validator.js).

### validator.js license:

```
Copyright (c) 2018 Chris O'Hara <cohara87@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
