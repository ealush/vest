---
sidebar_position: 2
title: Async Validations
description: Here's how to write async tests.
keywords: [Vest, Async, Validations, AbortSignal, AbortController, lazy]
---

# Async Tests

Vest supports asynchronous validation tests (e.g., checking if a username exists on the server).

```javascript
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test('username', 'Username already taken', async () => {
    await doesUserExist(data.username);
  });
});
```

:::note
In Vest, `suite.run()` returns a hybrid result object that is also a Promise. This means you can `await` it directly.
:::

## Handling Async Results

Because async tests take time to complete, `suite.run()` creates a result object that is initially "pending".

### Option 1: Awaiting the Result

In Vest, `suite.run()` returns a Promise-like object if there are async tests. You can simply `await` it.

```javascript
const result = await suite.run(data);

if (result.isValid()) {
  submitForm();
}
```

### Synchronous Access

`suite.run()` returns a hybrid object: it acts like a Promise for async completion, but its sync selectors are available immediately.

```javascript
const result = suite.run(data);

// Sync selectors are available right away
if (result.hasErrors('password')) {
  showPasswordError();
}

if (result.isPending('username')) {
  showSpinner();
}

// Await for final async completion
await result;
```

### Option 2: Using `.afterEach()`

If you prefer callbacks, or cannot use `await` at the call site, use the `.afterEach()` hook.

```javascript
suite
  .afterEach(result => {
    // This runs after the initial sync completion and after each async test finishes
    if (result.isValid()) {
      submitForm();
    }
  })
  .run(data);
```

:::info
Unlike `await`, the `afterEach` callback may run **multiple times** (once for sync completion, and again for each async completion). [Read more about Handling Suite Completion](../writing_your_suite/handling_completion.md).
:::

## Using AbortSignal

> Since 5.1.0

Each test function is passed an object with a `signal` property. This signal is an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which can be used to terminate your async operations once a test is canceled. Vest creates an AbortController for each test, and passes its signal to the test function.

The AbortSignal has a boolean `aborted` property, by which you can determine whether the test was canceled or not.

A test gets canceled when running the same test again before its previous run has completed.

You can use the AbortSignal to stop the execution of your async test, or pass it to your fetch request.

[More on AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

```javascript
test('name', 'Already Taken', async ({ signal }) => {
  const response = await fetch('/check-username', {
    signal,
    body: JSON.stringify({ username: data.username }),
  });
});
```
