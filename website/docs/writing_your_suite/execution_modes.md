---
sidebar_position: 5
title: Execution Modes
description: Vest has two execution modes - Eager mode and All. These modes determine how Vest behaves when a validation error occurs during the execution of a test suite.
keywords:
  [
    Vest execution modes,
    Eager mode vs all mode in Vest,
    Default execution mode in Vest,
    Changing execution mode in Vest,
    Validating all tests vs stopping at first failure in Vest,
    Performance optimization in Vest,
    Vest testing library,
    Vest Modes,
  ]
---

# Execution Modes

Vest provides two modes of execution - `Eager` and `All`. The mode determines how Vest behaves when a validation error occurs during the execution of a test suite.

## Eager Mode

`Eager` mode is the default mode of operation in Vest. When in this mode, Vest will stop executing tests for a given field once a test fails. This means that a failed test will immediately stop the execution of subsequent tests for the same field. In this way, Vest helps to speed up the testing process by stopping after the first error.

To set the mode to `Eager`, you don't need to do anything since this is already the default behavior. However, you can explicitly set it with the `mode()` function within the `create()` function:

```js
import { create, test, eager } from 'vest';

const suite = create('suite_name', () => {
  mode('EAGER');

  test('field_name', 'error_message', () => {
    // validate field
  });
});
```

:::tip NOTE
In Vest version 4, Eager mode was opt-in, and instead of stopping execution of a field when its validations failed, Vest continued to validate all tests. The reason for changing the default behavior to Eager mode in Vest 5 is that there is no much value in validating the field after we know that it failed to begin with. Stopping execution after the first error can save significant time when testing a large number of fields or running expensive validation tests.
:::

## All Mode

`All` mode is the alternative mode of operation in Vest. In this mode, Vest continues validating all tests within a field, even if a test fails. This means that Vest will execute all tests and report all failures within the test suite.

To set the mode to `All`, you can use the `mode()` function within the `create()` function:

```js
import { create, test, mode } from 'vest';

const suite = create('suite_name', () => {
  mode('ALL'); // set the mode to All

  test('field_name', 'error_message_1', () => {
    // validate field
  });

  test('field_name', 'error_message_2', () => {
    // validate field
  });
});
```

In the above example, if the first test fails, Vest will continue validating the second test and report both failures.

You can also use the `Modes` enum exported by Vest:

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

Note that the `mode()` function only applies within the test suite where it is called, and not within other test suites.
