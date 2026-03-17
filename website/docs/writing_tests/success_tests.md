---
sidebar_position: 5
title: Success messages
description: How to use success and useSuccess in Vest to add positive feedback for passing tests.
keywords: [vest, success, useSuccess, positive feedback, validation]
---

# Success messages

By default, Vest tests focus on failures (errors and warnings). However, sometimes you want to provide positive feedback when a test passes—for example, a "Password is strong" message or a checkmark next to a field.

To mark a test with a `success` severity, call `success()` from the body of your test. Unlike `warn()`, the success message will **only** be surfaced if the test passes.

If you need to set success severity after an `await` in an async test, use `useSuccess()` and call the setter it returns.

## `success()` vs `useSuccess()` in async tests

- You may only use `success()` and `useSuccess()` from within the body of a `test` function.
- `success()` should be called in the synchronous portion of your test.
- `useSuccess()` is the async-safe alternative when success severity needs to be set later.

```js
// ✔
test('password', () => {
  success();
  enforce(password).matches(/[A-Z]/);
});

// ✔ Use useSuccess() when you need to set success after await
test('username', async () => {
  const setSuccess = useSuccess();

  await checkAvailability(username);
  setSuccess();
});
```

## Behavior and Priority

1. **Opt-in only**: Passing tests do not have a "success" message by default. You must explicitly call `success()`.
2. **Passed tests only**: If a test marked with `success()` fails, the success message is discarded, and the test is treated as a regular failure (or warning).
3. **No impact on validity**: `success` severity never makes a suite or field invalid. It is purely informational.
4. **Message Priority**: `getMessage()` prioritizes messages in this order: `error` > `warn` > `success`.

### Using successes in the result object

You can access success messages using these methods:

```js
result.hasSuccesses(); // Returns whether any success messages are present in the suite.
result.hasSuccesses('password'); // Returns whether any success messages are present in the 'password' field.

result.getSuccesses(); // Returns an object with all fields that have successes.
result.getSuccesses('password'); // Returns an array of success messages for the password field.
```

**Read next about:**

- [Vest's result object](../writing_your_suite/accessing_the_result.md).
