---
sidebar_position: 2
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
