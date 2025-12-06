---
sidebar_position: 10
title: Understanding Vest's state
description: Learn how Vest's State works, and its drawbacks. Explore solutions for different scenarios.
keywords: [Vest, Stateful Validations, Field merge, Resetting, Removing fields]
---

# Understanding Vest's state

Vest is a framework designed to perform validations on user inputs. To provide good user experience, we validate fields upon user interaction. Vest's state mechanism helps us accomplish this.

The state mechanism helps validate [only the current field](./writing_your_suite/including_and_excluding/skip_and_only.md) and not the rest of the form, making it suitable for validating user inputs one by one.

When you skip fields in your validation suite, Vest will merge their results from the previous suite run with the current result object. This helps maintain state between suite runs.

## What Vest's state does

- _Skipped field merge_: Vest merges skipped fields' previous results with the current result object.

- _Lagging async `done` callback blocking_: When an async test doesn't finish from the previous suite run, Vest blocks the [`done()` callbacks](./writing_your_suite/accessing_the_result.md#done) for that field from running for the previous suite result.

# Drawbacks when using stateful validations

When validations are stateful, the benefit is that we don't have to keep track of which fields have already been validated and their previous results. However, the drawback of this approach is that when we run the same form in multiple unrelated contexts, the previous validation state still holds the previous result.

Here are some examples and solutions:

## Single Page Application - suite result retention

Suppose your form is a part of a single-page-app with client-side routing. In that case, if the user submits the form successfully, navigates outside the page, and later navigates back to the form, the form will have a successful validation state because the previous result is stored in the suite state.

### Solution: Resetting suite state with `.reset()`

In some cases, such as form reset, we want to discard previous validation results. This can be done with `vest.reset()`.

`.reset()` is a property on your validation suite. Calling it will remove the suite's state.

### Usage:

```js
import { create } from 'vest';

const suite = create(() => {
  // Your tests go here
});

suite.reset(); // validation result is removed from Vest's state.
```

## Dynamically added fields

When your form contains dynamically added fields, for example - when a customer can add fields to their checkout form on the fly, those items still exist in the suite state when the user removes them from the form. This means you may have an unsuccessful suite result, even though it should be successful.

### Solution: Removing a single field from the validation result

Instead of resetting the whole suite, we can alternatively remove just one field. This is useful when dynamically adding and removing fields upon user interaction, and we want to delete a deleted field from the state.

```js
import { create, test } from 'vest';

const suite = create(() => {
  // Your tests go here

  test('username', 'must be at least 3 chars long', () => {
    /*...*/
  });
});

suite.remove('username'); // validation result is removed from Vest's state.
```
