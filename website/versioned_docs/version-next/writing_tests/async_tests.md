---
sidebar_position: 2
title: Async Validations
description: How to write async tests, handle race conditions, and use AbortSignal for cancellation.
keywords:
  [
    Vest,
    Async,
    Validations,
    AbortSignal,
    AbortController,
    race conditions,
    lazy,
  ]
---

# Async Tests

Vest supports asynchronous validation tests (e.g., checking if a username exists on the server).

import AsyncTestsSandpack from '@site/src/components/Sandpack/AsyncTests';

<AsyncTestsSandpack />

:::note
In Vest, `suite.run()` returns a hybrid result object that is also a Promise. This means you can `await` it directly.
:::

## Handling Race Conditions

One of Vest's superpowers is **built-in race condition handling**. Consider this scenario:

1. User types "A" → async validation starts
2. User types "AB" → another async validation starts
3. User types "ABC" → another async validation starts
4. Validation for "A" returns (slow network)

**Without Vest:** The old "A" result might overwrite the current "ABC" validation, causing incorrect UI state.

**With Vest:** Vest automatically discards stale results. Only the most recent validation for each field is processed.

```javascript
// User types quickly: "A" → "AB" → "ABC"
// Even if "A" validation finishes last, Vest ignores it
// and only uses the "ABC" result
suite.run({ username: 'ABC' });
```

This is handled automatically - no extra code required.

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
suite;
suite
  .afterEach(() => {
    // This runs after the initial sync completion and after each async test finishes
    const result = suite.get();
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

Each test function is passed an object with a `signal` property. This signal is an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which can be used to terminate your async operations once a test is canceled.

### Why use AbortSignal?

When a user types quickly, Vest cancels the previous async test and starts a new one. The AbortSignal lets you:

1. **Stop unnecessary network requests** - Don't waste bandwidth on stale validations
2. **Cancel fetch requests** - Pass the signal to `fetch()` for automatic cancellation
3. **Clean up resources** - Check `signal.aborted` to bail early

```javascript
test('username', 'Already Taken', async ({ signal }) => {
  // Early exit if already aborted
  if (signal.aborted) return;

  const response = await fetch('/check-username', {
    signal, // Pass to fetch for automatic cancellation
    method: 'POST',
    body: JSON.stringify({ username: data.username }),
  });

  const { exists } = await response.json();
  enforce(exists).isFalsy();
});
```

[More on AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

## Best Practices for Async Validation

### 1. Debounce at the UI layer

Don't call `suite.run()` on every keystroke. Debounce in your component:

```javascript
const debouncedValidate = debounce(data => {
  suite.run(data);
}, 300);
```

### 2. Show pending state

Use `isPending()` to show loading indicators:

```javascript
const result = suite.run(data);

if (result.isPending('username')) {
  showLoadingSpinner();
}
```

### 3. Combine with `suite.only()`

For the best UX, only run async tests for the field the user is interacting with:

```javascript
function handleBlur(fieldName) {
  suite.only(fieldName).run(formData);
}
```

This skips expensive async checks for fields the user hasn't touched yet.
