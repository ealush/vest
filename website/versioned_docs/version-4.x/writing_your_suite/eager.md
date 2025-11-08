---
sidebar_position: 5
title: Failing Tests Fast with Eager mode
description: Sometimes we wish to fail fast and not continue run subsequent tests of a failing field. Eager mode tells Vest to fail immediately, and not continue executing tests of a failing fields.
keywords: [Vest, Eager, Eager mode, Fail fast]
---

# eager mode, failing fast

Sometimes we wish to fail fast and not continue run subsequent tests of a failing field. We can do this manually per test using [skipWhen](./including_and_excluding/skipWhen.md), but if we want to do this automatically for all the tests in the suite, we can set the suite to `eager` mode.

`eager` mode means that once a test of a given field fails, the suite will not continue running subsequent tests of that same field. Other tests will run normally.

:::tip NOTE
Eager mode disregards groups and nested blocks, meaning that a failing field at any level, will skip its subsequent runs regardless of where the test was specified.
:::

## Usage

```js
import { create, eager, test, enforce } from 'vest';

const suite = create(data => {
  eager(); // set the suite to eager mode

  test('name', 'Name is required', () => {
    enforce(data.name).isNotBlank();
  });

  // this test will not run if the previous test fails
  // because the suite is in eager mode
  test('name', 'Name is too short', () => {
    enforce(data.name).longerThan(3);
  });
});
```
