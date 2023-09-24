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

Each Vest test is passed as an argument an `AbortSignal` object. Vest internally sets the AbortSignal `aborted` property to true when the test is canceled.

A test is canceled when running the same test again before its previous run has completed.

You can use the AbortSignal to stop the execution of your async test, or pass it to your fetch request.

[Read more on AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

```js
test('name', 'Already Taken', async signal => {
  // ...
});
```
