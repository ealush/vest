---
sidebar_position: 6
title: Data Parsers
description: Built-in data parsers for transforming values in enforce chains. Parsers coerce and reshape data as part of validation.
keywords:
  [
    Vest,
    enforce,
    parsers,
    transform,
    trim,
    toBoolean,
    parseJSON,
    clamp,
    toTitle,
    toCamel,
    toKebab,
    toSnake,
    defaultTo,
    n4s,
  ]
---

# Data Parsers

Data parsers transform values as they pass through an enforce chain. Unlike validation rules that only check whether a value is valid, parsers **coerce the value** into a new form — trimming whitespace, converting types, clamping numbers, and more.

Parsers are available on **lazy chains** started with a type rule such as `enforce.isString()`, `enforce.isNumber()`, or `enforce.isArray()`. They are not available on eager `enforce(value)` chains.

## Accessing parsed results

Use `.run()` or `.parse()` to get the transformed output:

```js
// .run() returns { pass, type } — type holds the transformed value
const result = enforce.isString().trim().toUpper().run('  hello  ');
// result → { pass: true, type: 'HELLO' }

// .parse() returns the transformed value directly, or throws on failure
const value = enforce.isString().trim().toUpper().parse('  hello  ');
// value → 'HELLO'
```

Parsers also work inside schema definitions, so `schema.parse(data)` returns a fully transformed object:

```js
const schema = enforce.shape({
  name: enforce.isString().trim().toTitle(),
  age: enforce.isNumeric().toNumber().clamp(0, 120),
});

schema.parse({ name: '  jANE DOE ', age: '180' });
// → { name: 'Jane Doe', age: 120 }
```

---

## String Parsers

Available on `enforce.isString()` chains.

### trim

Removes leading and trailing whitespace.

```js
enforce.isString().trim().parse('  vest  ');
// → 'vest'
```

### trimStart

Removes leading whitespace only.

```js
enforce.isString().trimStart().parse('  vest');
// → 'vest'
```

### trimEnd

Removes trailing whitespace only.

```js
enforce.isString().trimEnd().parse('vest  ');
// → 'vest'
```

### toUpper

Converts to uppercase.

```js
enforce.isString().toUpper().parse('vest');
// → 'VEST'
```

### toLower

Converts to lowercase.

```js
enforce.isString().toLower().parse('VeSt');
// → 'vest'
```

### toTitle

Capitalizes the first letter of each word.

```js
enforce.isString().toTitle().parse('hello world');
// → 'Hello World'
```

### toCapitalized

Capitalizes the first character and lowercases the rest.

```js
enforce.isString().toCapitalized().parse('vEST');
// → 'Vest'
```

### toCamel

Converts to camelCase.

```js
enforce.isString().toCamel().parse('hello_world-test');
// → 'helloWorldTest'
```

### toPascal

Converts to PascalCase.

```js
enforce.isString().toPascal().parse('hello_world-test');
// → 'HelloWorldTest'
```

### toSnake

Converts to snake_case.

```js
enforce.isString().toSnake().parse('helloWorld Test');
// → 'hello_world_test'
```

### toKebab

Converts to kebab-case.

```js
enforce.isString().toKebab().parse('helloWorld Test');
// → 'hello-world-test'
```

### append

Appends a suffix string.

```js
enforce.isString().append('-js').parse('vest');
// → 'vest-js'
```

### prepend

Prepends a prefix string.

```js
enforce.isString().prepend('hello-').parse('vest');
// → 'hello-vest'
```

### replace

Replaces the first match of a search value.

```js
enforce.isString().replace('rocks', 'rules').parse('vest rocks');
// → 'vest rules'
```

### replaceAll

Replaces all occurrences of a search value.

```js
enforce.isString().replaceAll('vest', 'n4s').parse('vest vest vest');
// → 'n4s n4s n4s'
```

### split

Splits a string into an array by a separator. Accepts an optional limit.

```js
enforce.isString().split(',', 2).parse('a,b,c');
// → ['a', 'b']
```

### normalizeWhitespace

Collapses multiple whitespace characters into a single space and trims.

```js
enforce.isString().normalizeWhitespace().parse('  v   e   s t  ');
// → 'v e s t'
```

### stripWhitespace

Removes all whitespace characters.

```js
enforce.isString().stripWhitespace().parse(' v e s t ');
// → 'vest'
```

### removeNonAlphanumeric

Removes all characters that are not letters or digits.

```js
enforce.isString().removeNonAlphanumeric().parse('v-e_s t!42');
// → 'vest42'
```

### removeNonDigits

Removes all non-digit characters.

```js
enforce.isString().removeNonDigits().parse('v1e2s3t');
// → '123'
```

### removeNonLetters

Removes all non-letter characters.

```js
enforce.isString().removeNonLetters().parse('v1e_2s-3t!');
// → 'vest'
```

---

## Number Parsers

Available on `enforce.isNumber()` and `enforce.isNumeric()` chains.

### round

Rounds to the nearest integer.

```js
enforce.isNumber().round().parse(2.5);
// → 3
```

### ceil

Rounds up to the next integer.

```js
enforce.isNumber().ceil().parse(2.1);
// → 3
```

### floor

Rounds down to the previous integer.

```js
enforce.isNumber().floor().parse(2.9);
// → 2
```

### clamp

Clamps a value between a minimum and maximum.

```js
enforce.isNumeric().toNumber().clamp(0, 100).parse('120');
// → 100

enforce.isNumber().clamp(0, 100).parse(-5);
// → 0
```

### toAbsolute

Returns the absolute value.

```js
enforce.isNumber().toAbsolute().parse(-15);
// → 15
```

### toFloat

Parses a value into a floating-point number. Fails if the result is `NaN`.

```js
enforce.isNumeric().toFloat().parse('10.5');
// → 10.5
```

### toInteger

Parses a value into an integer. Accepts an optional radix (2–36, default 10). Fails if the result is `NaN`.

```js
enforce.isNumeric().toInteger().parse('11.8');
// → 11

enforce.isNumeric().toInteger(2).parse('1011');
// → 11
```

### toDate

Parses a string, number, or Date into a `Date` object. Fails for invalid or non-date-like inputs.

```js
enforce.isNumber().toDate().parse(1704067200000);
// → Date object (2024-01-01T00:00:00.000Z)
```

---

## Array Parsers

Available on `enforce.isArray()` chains.

### uniq

Removes duplicate elements (uses `Set`).

```js
enforce.isArray().uniq().parse(['a', 'a', 'b']);
// → ['a', 'b']
```

### join

Joins array elements into a string with a separator (default `','`).

```js
enforce.isArray().join('-').parse(['a', 'b', 'c']);
// → 'a-b-c'
```

---

## General Parsers

Available on **all** typed chains (`isString`, `isNumber`, `isNumeric`, `isArray`).

### toBoolean

Parses a value into a boolean. Recognizes common truthy/falsy representations. Fails for unrecognized input.

**Truthy values:** `true`, `1`, `'true'`, `'1'`, `'yes'`, `'on'`

**Falsy values:** `false`, `0`, `'false'`, `'0'`, `'no'`, `'off'`

```js
enforce.isString().trim().toBoolean().parse(' yes ');
// → true

enforce.isString().trim().toBoolean().parse('0');
// → false

// Fails for unrecognized values:
enforce.isString().toBoolean().run('unknown');
// → { pass: false, type: false, message: 'Could not parse to boolean' }
```

### parseJSON

Parses a JSON string into a JavaScript value. Fails if the input is not valid JSON.

```js
enforce.isString().parseJSON().parse('{"name":"vest"}');
// → { name: 'vest' }
```

### defaultTo

Provides a fallback value for `null` or `undefined` inputs. This parser runs **before** other rules in the chain, so the fallback is applied before type checks.

```js
const schema = enforce.shape({
  label: enforce.isString().defaultTo('N/A'),
});

schema.parse({ label: null });
// → { label: 'N/A' }

schema.parse({ label: 'hello' });
// → { label: 'hello' }
```

---

## Chaining Parsers

Parsers can be chained together to build transformation pipelines. Each parser receives the output of the previous one:

```js
const schema = enforce.shape({
  name: enforce.isString().trim().toTitle(),
  age: enforce.isNumeric().toNumber().clamp(0, 120),
  subscribed: enforce.isString().trim().toBoolean(),
  tags: enforce.isArray().uniq().join('|'),
  payload: enforce.isString().parseJSON(),
  nickname: enforce.isString().trim().defaultTo('N/A'),
});

schema.parse({
  name: '  jANE DOE ',
  age: '180',
  subscribed: ' yes ',
  tags: ['vest', 'n4s', 'vest'],
  payload: '{"env":"test"}',
  nickname: '   ',
});
// → {
//   name: 'Jane Doe',
//   age: 120,
//   subscribed: true,
//   tags: 'vest|n4s',
//   payload: { env: 'test' },
//   nickname: '',
// }
```
