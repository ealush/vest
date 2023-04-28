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
  ]
---

# Enforce: The Assertion Library for Vest

Enforce is a powerful assertion library used in the Vest validation framework to validate and enforce certain conditions on input data. With its intuitive API and fluent syntax, Enforce makes it easy to perform data validation and ensure that your code is robust and error-free.

## How to Use Enforce

Enforce is used within a Vest test, and can be imported alongside the `test` function from the `vest` package:

```js
import { enforce, test } from 'vest';
```

Once imported, you can use `enforce` to perform assertions on your input data. Here's a basic example that checks whether a `username` string is longer than `2` characters:

```js
test('username', 'Must be at least three characters long', () => {
  enforce(username).longerThan(2);
});
```

In this example, the `enforce` function is called with the `username` variable as input data, and the `longerThan` assertion is chained onto the function call with the value `2` passed as an argument. If the `username` string is shorter than `3` characters, the assertion will fail and an error will be thrown.

## Fluent Chaining API

Enforce provides a fluent chaining API that allows you to chain multiple assertions together and test various conditions on your input data. Here's an example that checks whether a number is greater than `2`:

```js
enforce(4).isNumber().greaterThan(2);
```

In this example, the `enforce` function is called with the number `4` as input data. The `isNumber` assertion is first chained onto the function call to check that the input is a number, and then the `greaterThan` assertion is chained on to check whether the input number is greater than `2`. If either of these assertions fails, an error will be thrown.
