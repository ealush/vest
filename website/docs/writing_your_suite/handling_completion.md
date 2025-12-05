---
sidebar_position: 4
title: Handling Suite Completion
description: Learn how to handle the completion of your validation suite using Promises or callbacks.
keywords:
  [Vest, suite, completion, async, await, afterEach, afterField, promise, callback]
---

# Handling Suite Completion

Vest suites run synchronously by default, but they often contain asynchronous tests (e.g., checking if a username is taken). Vest provides two main ways to handle the completion of your suite:

1.  **Promises (Recommended)**: `await suite.run()`
2.  **Event Callbacks**: `suite.afterEach()` and `suite.afterField()`

## 1. Promise-based Handling (Recommended)

For most modern applications, simply awaiting the result is the cleanest way to handle async validations. The result object returned by `suite.run()` implements the Promise interface, so you can `await` it directly.

The promise resolves **once**, when **all** tests (both synchronous and asynchronous) have finished.

```javascript
const result = await suite.run(formData);

if (result.isValid()) {
  // All tests passed! Submit the form.
  submitForm(formData);
} else {
  // Handle errors
  showErrors(result.getErrors());
}
```

### When to use it?

- When you need to block an action (like form submission) until validation is complete.
- When you want linear, readable code using `async/await`.

## 2. Using `suite.afterEach(callback)`

If you prefer an event-driven approach, or if you need to react to updates _during_ the validation process (e.g., updating the UI as individual async tests complete), use `suite.afterEach()`.

`suite.afterEach()` registers a callback that runs after the initial sync completion and again after each async test finishes. It is chainable and can be attached before or during the run.

### Key Behavior

Unlike a Promise which resolves only once, **`afterEach` callbacks may run multiple times**:

1.  It runs **immediately** after the synchronous pass.
2.  It runs **again** whenever an async test completes.

This makes it perfect for keeping your UI in sync with the validation state.

```javascript
suite
  .afterEach(res => {
    // Called when the suite finishes sync execution
    // AND whenever an async test completes
    updateUI(res);
  })
  .run(data);
```

### When to use it?

- When you want to update the UI reactively as validation progresses.
- When you are using a framework that relies on callbacks or subscriptions.

## 3. Using `suite.afterField(fieldName, callback)`

Sometimes you only care about the completion of a specific field. `suite.afterField()` is a specialized hook that runs whenever a test for a specific field finishes running.

If a field has multiple asynchronous tests, this callback will run multiple times (once for each completing test).

This is highly useful for UI patterns like removing a loading spinner from a specific input "on blur" or when its validation completes.

```javascript
suite
  .afterField('username', res => {
    // Runs when a test for 'username' finishes
    setLoading('username', false);

    if (res.hasErrors('username')) {
      showUsernameError(res.getErrors('username'));
    }
  })
  .run(data);
```

## 4. Chaining Methods

Both `afterEach` and `afterField` return the suite API, allowing for fluent chaining.

```javascript
suite
  .afterEach(updateGeneralUI)
  .afterField('email', handleEmailCompletion)
  .afterField('username', handleUsernameCompletion)
  .run(data);
```

## Migration from V5

In Vest 5, the `done()` method was used on the result object. In Vest 6, this has been moved to the suite object itself for better ergonomics and chaining support.

| Vest 5                  | Vest 6                                |
| :---------------------- | :------------------------------------ |
| `res.done(cb)`          | `suite.afterEach(cb).run()`           |
| `res.done('field', cb)` | `suite.afterField('field', cb).run()` |
