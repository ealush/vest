---
sidebar_position: 4
title: Warn only tests
description: How to use warn and useWarn in Vest to create warn-only tests. Warn-only tests are useful when you want to fail a test without marking the suite as invalid.
keywords: [vest, warn, useWarn, warn only tests, validation, password strength]
---

# Warn-only tests

By default, a failing test has a severity of `error`. Sometimes you may need to lower the severity level of a given test to `warn` so that even when it fails, it should not prevent submission. An example of this would be validating password strength.

To set a test's severity level to `warn`, call `warn()` from the body of your test.

If you need to set warning severity after an `await` in an async test, use `useWarn()` and call the setter it returns.

import WarnOnlyTestsSandpack from '@site/src/components/Sandpack/WarnOnlyTests';

<WarnOnlyTestsSandpack />

## `warn()` vs `useWarn()` in async tests

- You may only use `warn()` and `useWarn()` from within the body of a `test` function.
- `warn()` should be called in the synchronous portion of your test.
- `useWarn()` is the async-safe alternative when warning severity needs to be set later.

```js
// ✔
test('password', async () => {
  warn();
  return await someAsyncFunction();
});

// ✔
test('password', () => {
  warn();
  return anAsyncFunction();
});

// 🚨 This will result in your warn() call not taking effect
test('password', async () => {
  await someAsyncFunction();

  warn(); // 🚨
});

// 🚨 This will result in your warn() call not taking effect
test('password', () => {
  return anAsyncFunction().then(() => {
    warn(); // 🚨
  });
});

// ✔ Use useWarn() when you need to set warn after await
test('password', async () => {
  const setWarn = useWarn();

  await someAsyncFunction();
  setWarn();

  enforce(passwordStrength).isNotWeak();
});
```

### Using warning in the result object

Just like you do with errors, you can access the errors in your validation warnings using these methods:

```js
result.hasWarnings(); // Returns whether any warnings are present in the suite.
result.hasWarnings('password'); // Returns whether any warnings are present in the 'password' field.

result.getWarnings(); // Returns an object with all the fields that have warnings, and an array of warnings for each.
result.getWarnings('password'); // Returns an array of warnings for the password field.
```

**Read next about:**

- [Vest's result object](../writing_your_suite/accessing_the_result.md).
