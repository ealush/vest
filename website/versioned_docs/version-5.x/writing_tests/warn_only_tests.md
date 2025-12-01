---
sidebar_position: 4
title: Warn only tests
description: How to use the warn function in Vest to create warn-only tests. Warn-only tests are useful when you want to fail a test without marking the suite as invalid..
keywords: [vest, warn, warn only tests, validation, password strength]
---

# Warn-only tests

By default, a failing test has a severity of `error`. Sometimes you may need to lower the severity level of a given test to `warn` so that even when it fails, it should not prevent submission. An example of this would be validating password strength.

To set a test's severity level to `warn` call the warn function from the body of your test.

```js
import { create, test, enforce, warn } from 'vest';

const suite = create(data => {
  test('password', 'A password must have at least 6 characters', () => {
    enforce(data.password).longerThan(5);
  }); // this test has a severity level of `error`

  test('password', 'Your password strength is: WEAK', () => {
    warn();

    enforce(data.password).matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]$/,
    );
  }); // this test has a severity level of `warn`

  test('password', 'Your password strength is: MEDIUM', () => {
    warn();

    enforce(data.password).matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]$/,
    );
  }); // this test has a severity level of `warn`
});

const validationResult = suite(data);
```

**Limitations when using warn()**

- You may only use warn from within the body of a `test` function.
- When using `warn()` in an async test you should call the `warn` function in the sync portion of your test (and not after an `await` call or in the Promise body). Ideally, you want to call `warn()` at the top of your test function.

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
