---
sidebar_position: 1
title: Vest's Suite
description: All your validations reside in a Vest suite. The suite is a function that retains a javascript closure with the current validation state, and it returns the result object. It also exposes some methods to interact with the data, reset the state and handle async validations.
keywords:
  [
    Vest,
    Suite,
    Form,
    Validation,
    create,
    suite callback,
    result object,
    hasErrors,
    suite.get(),
    suite.reset(),
    suite.resetField(),
    suite.remove(),
    async validations,
  ]
---

# Vest's Suite: Writing Your Validation Suite

A Vest suite is the container for all your validations, where you can define and organize them. In this article, we will explain how to create a Vest suite and perform various operations on it.

## Basic Suite Structure

You can create a Vest suite using the `create` function provided by the `Vest` module. Here's a basic example:

```js
import { create } from 'vest';

const suite = create((data = {}) => {
  // ... Your validations go here
});
```

You pass a callback function to the `create` function, which takes the form data as its first argument, and any other arguments you might want to pass. You can then define your validations inside this function.

## Running the Suite

You can run your suite by calling it with the form data and any additional arguments you want to pass:

```js
const suite = create((data = {}, currentField) => {
  // ... Your validations go here
});

suite(formData, fieldName);
```

You can pass as many arguments as you need to the suite function, and they will be available inside the callback function.

## Getting the Current Suite State

There are two main ways of getting the current state of our suite:

### Using the Result Object

When you run the suite, it returns a result object that contains the validation state:

```js
const result = suite(formData, fieldName);

result.hasErrors(); // boolean
```

The result object is similar to the one you define in your suite function, except that it does not have the `done` property that allows you to set callbacks for async validations.

### Using `suite.get()`

You can also get the current state of your suite by calling `suite.get()` at any time, even within the suite itself. This method returns the current validation state, which may be partial if called within a running suite.

This method is especially useful if we want to access our suite state from within a running suite, or when out of context - for example, from a different UI component than our form.

## Cleaning up the Suite State

If you need to clean up the validation state of your suite, you can call `suite.reset()`. This will reset the state of the suite and cancel any pending async validations that might still be running.

## Resetting a Single Field

To reset the validity of a single field, you can call `suite.resetField(fieldName)`. This can be useful, for example, when you only want to run the validation on blur.

## Removing a Single Field from the Suite State

In some cases, you may want to remove a field from the suite state. For example, when the user removes a dynamically added field. In this case, you can call `suite.remove(fieldName)` to remove the field from the state and cancel any pending async validations that might still be running.

Note that you don't need to use `suite.remove` very often, as most users can simply use `reset` and `omitWhen`.
