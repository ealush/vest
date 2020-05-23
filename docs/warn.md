# Warn only tests

By default, a failing test has a severity of `error`. Sometimes you may need to lower the severity level of a given test to `warn` so that even when it fails, it should not prevent submission. An example of this would be validating password strength.

To set a test's severity level to `warn`, you need to simply call Vest's warn function from your test body.

```js
import vest, { test, enfroce } from 'vest';

const validate = vest.create('Password', data => {
  test('password', 'A password must have at least 6 characters', () => {
    enforce(data.password).longerThan(5);
  }); // this test has a severity level of `error`

  test('password', 'Your password strength is: WEAK', () => {
    vest.warn();

    enforce(data.password).matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]$/
    );
  }); // this test has a severity level of `warn`

  test('password', 'Your password strength is: MEDIUM', () => {
    vest.warn();

    enforce(data.password).matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]$/
    );
  }); // this test has a severity level of `warn`
});

const validationResult = validate(data);
```

**Limitations when using vest.warn()**

- You may only use warn from within the body of a `test` function.
- When using `vest.warn()` in an async test you should call the `warn` function in the sync portion of your test (and not after an `await` call or in the Promise body). Ideally, you want to call `vest.warn()` at the top of your test function.

```js
// ✔
test('password', async () => {
  vest.warn();
  return await someAsyncFunction();
});

// ✔
test('password', () => {
  vest.warn();
  return anAsyncFunction();
});

// 🚨 This will result in an your warn() call not taking effect
test('password', async () => {
  await someAsyncFunction();

  vest.warn(); // 🚨
});

// 🚨 This will result in an your warn() call not taking effect
test('password', () => {
  return anAsyncFunction().then(() => {
    vest.warn(); // 🚨
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

- [Vest's result object](./result).
