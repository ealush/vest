---
sidebar_position: 5
title: Execution Modes
description: Vest has three execution modes - Eager mode, All mode, and One mode. These modes determine how Vest behaves when a validation error occurs during the execution of a test suite.
keywords:
  [
    Vest execution modes,
    Eager mode vs all mode vs one mode in Vest,
    Default execution mode in Vest,
    Changing execution mode in Vest,
    Validating all tests vs stopping at first failure in Vest,
    Performance optimization in Vest,
    Vest testing library,
    Vest Modes,
  ]
---

# Execution Modes

Vest provides three modes of execution - `Eager`, `One` and `All`. The mode determines how Vest behaves when a validation error occurs during the execution of a test suite. They can be set using the `mode()` function within the `create()` function.

- **Eager**: Stops executing tests for a field once a test fails, improving testing speed by stopping after the first error.

- **All**: Continues validating all tests within a field, even if a test fails, and reports all failures within the test suite.

- **One**: Stops executing tests for a field once a test fails and skips all subsequent tests, regardless of the field, useful when knowing that at least one test has failed is sufficient.

## Eager Mode

`Eager` mode is the default mode of operation in Vest. When in this mode, Vest will stop executing tests for a given field once a test fails. This means that a failed test will immediately stop the execution of subsequent tests for the same field. In this way, Vest helps to speed up the testing process by stopping after the first error.

To set the mode to `Eager`, you don't need to do anything since this is already the default behavior.

:::tip NOTE
In Vest version 4, Eager mode was opt-in, and instead of stopping execution of a field when its validations failed, Vest continued to validate all tests. The reason for changing the default behavior to Eager mode in Vest 5 is that there is no much value in validating the field after we know that it failed to begin with. Stopping execution after the first error can save significant time when testing a large number of fields or running expensive validation tests.
:::

## All Mode

`All` mode is the alternative mode of operation in Vest. In this mode, Vest continues validating all tests within a field, even if a test fails. This means that Vest will execute all tests and report all failures within the test suite.

To set the mode to `All`, you can use the `mode()` function within the `create()` function:

```js
import { create, test, mode, Modes } from 'vest';

const suite = create('suite_name', () => {
  mode(Modes.ALL); // set the mode to All

  test('field_name', 'error_message_1', () => {
    // validate field
  });

  test('field_name', 'error_message_2', () => {
    // validate field
  });
});
```

In the above example, if the first test fails, Vest will continue validating the second test and report both failures.

## One mode

`One` mode is a mode of operation in Vest that is similar to `Eager` mode, but with a slight difference in behavior. In `One` mode, like `Eager` mode, Vest stops executing tests for a given field once a test fails. However, unlike `Eager` mode, `One` mode goes a step further and skips all the tests that follow a failing test, regardless of the field they belong to.

The purpose of `One` mode is to optimize the testing process when you don't need a detailed list of all the failed tests, but rather only need to know if at least one test has failed. This mode is particularly useful when performing server-side validation at the API level, where knowing that there is at least one validation failure is sufficient.

To set the mode to `One`, you can use the `mode()` function within the `create()` function:

```js
import { create, test, mode, Modes } from 'vest';

const suite = create('suite_name', () => {
  mode(Modes.ONE); // set the mode to One

  // 🚨 If this test fails, all next tests will be skipped
  test('field_1', 'error_message_1', () => {
    /*...*/
  });

  test('field_2', 'error_message_2', () => {
    /*...*/
  });
});
```

In the above example, if the first test fails, Vest will immediately stop executing any remaining tests for the same field and also skip all tests for subsequent fields within the test suite.
