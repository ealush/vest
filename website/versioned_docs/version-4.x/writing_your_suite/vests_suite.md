---
sidebar_position: 1
title: Vest's Suite
description: All your validations reside in a Vest suite. The suite is a function that retains a javascript closure with the current validation state, and it returns the result object. It also exposes some methods to interact with the data, reset the state and handle async validations.
keywords: [Vest, Suite, Form, Validation]
---

# Vest's Suite

All your validations reside in a Vest suite. The suite is a function that retains a javascript closure with the current validation state, and it returns the result object. It also exposes some methods to interact with the data, reset the state and handle async validations.

## Basic suite structure

In its most basic shape, a suite is created by calling `create` imported from Vest.

```js
import { create } from 'vest';

const suite = create((data = {}) => {
  // ...
});
```

## Running the suite

Your suite accepts any number of arguments. You can access them from the suite callback:

```js
const suite = create((data = {}, currentField) => {
  // ...
});

suite(formData, fieldName);
```

## Getting the current suite state

There are two main ways of getting the current state of our suite.

### Using the return value of our suite

When running our suite, it returns the current result object:

```js
const result = suite(formData, fieldName);

result.hasErrors(); // boolean
```

### Using suite.get()

At any given moment (even within the suite itself!) you can run `suite.get()`. `suite.get()` returns the currently known validation state (may be partial if called within a running suite).
The result object returned by `suite.get()` is nearly identical to the result object returned by your suite, with the difference that it does not have the `done` property that allows you to set callbacks for async validations.

This method is especially useful if we want to access our suite state from within a running suite, or when out of context - for example, from a different UI component than our form.

## Cleaning up our validation state

When you want to clean up the suite state, for example, when the user clears the form, or when you want to navigate out of the page in an SPA - but the user might return to it later on, you can call `suite.reset()`. This will reset the suite state and cancel any pending async validations that may still be running.

## Resetting a single field

Sometimes you wish to only reset the validity of a single field, for example - if you want to to reset the validity as the user starts typing again and you only run the validation on blur.

Simply call `suite.resetField(fieldName)` and that field will be reset to its untested state.

## Removing a single field from the suite state

Note: You rarely need to use `suite.remove`, and this is mostly useful for external libraries validating on your behalf. Most users are fine using `reset` and `omitWhen`.

Sometimes we want to remove a certain field from the suite state. For example, when the user removed a dynamically added field. In this case, we can call `suite.remove(fieldName)`. This will remove the field from the suite state and cancel any pending async validations that may still be running.
