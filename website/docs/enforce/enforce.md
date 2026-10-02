---
sidebar_position: 1
title: enforce
description: Enforce is Vest's assertion library. It is used to validate values within a Vest test.
keywords:
  [
    Vest,
    Enforce,
    validation,
    validation library,
    assertions,
    data validation,
    fluent API,
    chaining,
    input data,
    conditions,
    functional,
    composable,
  ]
---

# Enforce: The Assertion Library for Vest

Enforce is the assertion library used inside Vest tests. Its rules are:

- **Fluent** - Chain multiple assertions together naturally
- **Composable** - Build reusable validators from smaller pieces
- **Extensible** - Add your own custom rules

## Basic Usage

Import `enforce` from Vest and use it inside your tests:

import EnforcePlayground from '@site/src/components/Sandpack/EnforcePlayground';

```js
import { enforce, test } from 'vest';

test('username', 'Must be at least three characters long', () => {
  enforce(username).longerThan(2);
});
```

When an assertion fails, it throws an error that Vest catches and records as a failed test.

## Fluent Chaining

Chain multiple assertions together to test various conditions:

<EnforcePlayground />

All assertions must pass for the test to pass. If any assertion fails, the test stops at that point.

## Common Patterns

### Validating Strings

```js
// Required field
enforce(email).isNotBlank();

// Email format
enforce(email).isEmail();

// Length constraints
enforce(password).longerThanOrEquals(8).shorterThanOrEquals(128);
```

### Validating Numbers

```js
// Range check
enforce(age).isNumber().greaterThanOrEquals(18).lessThan(120);

// Positive number
enforce(price).isPositive();
```

### Validating Objects

```js
// Check shape/structure
enforce(user).shape({
  name: enforce.isString(),
  email: enforce.isEmail(),
  age: enforce.isNumber(),
});
```

## Composing Rules

For rules you use together frequently, create reusable validators:

```js
import { enforce, compose } from 'vest';

const isValidAge = compose(
  enforce.isNumber(),
  enforce.greaterThanOrEquals(18),
  enforce.lessThan(120),
);

// Use like any other rule
test('age', 'Must be a valid age', () => {
  enforce(data.age).condition(isValidAge);
});
```

:::tip Functional Programming
Enforce rules are **just functions**. The `compose` utility lets you build complex validators from simple, testable pieces - exactly like function composition in FP.
:::

[Learn more about composing rules →](./composing_enforce_rules.md)

## Available Rules

Enforce comes with a rich set of built-in rules:

| Category         | Examples                                                       |
| ---------------- | -------------------------------------------------------------- |
| **Type Checks**  | `isString()`, `isNumber()`, `isBoolean()`, `isArray()`         |
| **String Rules** | `isNotBlank()`, `isEmail()`, `matches()`, `startsWith()`       |
| **Number Rules** | `greaterThan()`, `lessThan()`, `isPositive()`, `isNegative()`  |
| **Comparison**   | `equals()`, `notEquals()`, `inside()`, `notInside()`           |
| **Collection**   | `lengthEquals()`, `longerThan()`, `shorterThan()`, `isEmpty()` |
| **Shape**        | `shape()`, `loose()`, `isArrayOf()`                            |

[View all rules →](./enforce_rules.md)

## Custom Rules

Need validation logic that isn't built-in? Create your own:

```js
import { enforce } from 'vest';

enforce.extend({
  isValidUsername(value) {
    return /^[a-zA-Z0-9_]+$/.test(value);
  },
});

// Now use it anywhere
enforce(username).isValidUsername();
```

[Learn more about custom rules →](./creating_custom_rules.md)

## Next Steps

- [All Built-in Rules](./enforce_rules.md) - Complete reference
- [Composing Rules](./composing_enforce_rules.md) - Build reusable validators
- [Custom Rules](./creating_custom_rules.md) - Extend with your own logic
