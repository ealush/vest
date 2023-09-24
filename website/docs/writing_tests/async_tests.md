---
sidebar_position: 2
title: Async Validations
description: Here's how to write async tests.
keywords: [Vest, Async, Validations]
---

# Writing Asynchronous Tests

Sometimes you need to validate your data with information not present in your current context, for example - data from the server, such as username availability. In those cases, you need to go out to the server and fetch data as part of your validation logic.

An async test is declared by returning a promise from your test body (or making it an async function). When the promise resolves, your test passes, and when your promise rejects, it fails.

```js
// Example using a promise
test('name', 'I always fail', () => Promise.reject());

// Example using async/await
test('name', 'Already Taken', async () => {
  return await doesUserExist(user);
});
```

## Using AbortSignal

> Since 5.1.0

Each test function is passed an object with a `signal` property. This signal is an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which can be used to terminate your async operations once a test is canceled.

The AbortSignal has a boolean `aborted` property, by which you can determine whether the test was canceled or not.

A test gets canceled when running the same test again before its previous run has completed.

You can use the AbortSignal to stop the execution of your async test, or pass it to your fetch request.

[More on AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

```js
test('name', 'Already Taken', async ({ signal }) => {
  // ...
});
```
