# Using the `test` function

The `test` function is represents a single case in your validation suite. It accepts the following arguments:

| Name       | Type       | Optional | Description                                                   |
| ---------- | ---------- | -------- | ------------------------------------------------------------- |
| `name`     | `String`   | No       | The name of the value or field being validated.               |
| `message`  | `String`   | Yes      | An error message to display to the user in case of a failure. |
| `callback` | `Function` | No       | The actual validation logic for the given test.               |

A test can either be synchronous or asynchronous, and it can either have a [severity](./warn) of `error` or of `warn`.

## Failing a test

There are three ways to fail a test:

### Throwing inside your test body (using enforce)

Just like in most unit testing frameworks, a validation fails whenever the test body throws an exception. [`Enforce`](./enforce) throws on failed validations.
When thrown with a string

```js
// const username = 'Gina.Vandervort';
// const password = 'Q3O';

test('username', 'Should be at least 3 characters long', () => {
  enforce(username).longerThanOrEquals(3);
}); // this test passes

test('password', 'Should be at least 6 characters long', () => {
  enforce(password).longerThanOrEquals(6); // an error is thrown here
}); // this test fails
```

Alternatively, you can also throw a string value to use it as your test message. To do that, you need to omit the test message, and throw a string, for example - when using enforce.extend.

```js
enforce.extend({
  isChecked: value => {
    return {
      pass: !!value.checked,
      message: () => 'value must be checked',
    };
  },
});

/*...*/

/*
  tost = { checked: false }
*/

test('tos', () => {
  enforce(tos).isChecked(); // will fail with the message: "value must be checked"
});
```

### Explicitly returning false

To make it easy to migrate your existing validation logic into Vest, it also supports validations explicitly returning `false` (and not any other falsy value) to represent failures.

```js
// const username = 'Gina.Vandervort';
// const password = 'Q3O';

test('username', 'Should be at least 3 characters long', () => {
  return username.length >= 3; // = true
}); // this test passes

test('password', 'Should be at least 6 characters long', () => {
  return password.length >= 6; // = false
}); // this test fails
```

### Rejecting a Promise

This is only true for async tests, more on that below.

## Asynchronous Tests

Sometimes you need to validate your data with information not present in your current context, for example - data from the server, such as username availability. In those cases, you need to go out to the server and fetch data as part of your validation logic.

An async test is declared by returning a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) from your test body. When the promise resolves, your test passes, and when your promise rejects, it fails.

```js
// Example using a promise
test('name', 'I always fail', () => Promise.reject());

// Example using async/await
test('name', 'Already Taken', async () => {
  return await doesUserExist(user);
});
```

### Rejecting with a message

When performing validations on the server, your server might need to respond with different error messages. When rejecting with a string value, your string value will be picked up as the message to show to the user.

```js
test('name', () =>
  new Promise((resolve, reject) => {
    fetch(`/checkUsername?name=${name}`)
      .then(res => res.json)
      .then(data => {
        if (data.status === 'fail') {
          reject(data.message); // rejects with message and marks the test as failing
        } else {
          resolve(); // completes. doesn't mark the test as failing
        }
      });
  }));
```

## test.memo for memoized tests

In order to improve performance and runtime in heavy or long-running tests (such as async tests that go to the server), tests individual test results can be cached and saved for a later time, so whenever the exact same params appear again in the same runtime, the test result will be used from cache, instead of having to be re-evaluated.

### Usage:

Memoized tests are almost identical to regular tests, only with the added dependency array as the last argument. The dependency array is an array of items, that when identical (strict equality, `===`) to a previously presented array in the same test, its previous result will be used. You can see it as your cache key to the test result.

### Example:

```js
import { test, create } from 'vest';
export default create(data => {
  test.memo(
    'username',
    'username already exists',
    () => doesUserExist(data.username),
    [data.username]
  );
});
```

## test.each for dynamically creating tests from a table

Use test.each when you need to dynamically create tests from data, or when you have multiple tests that have the same overall structure.

test.each takes an array of arrays. The inner array contains the arguments that each of the tests will recieve.

Because of the dynamic nature of the iterative tests, you can also dynamically construct the fieldName and the test message by providing a function instead of a string. Your array's content will be passed over as arguments to each of these functions.

```js
/*
const data = {
  products: [
    ['Game Boy Color', 25],
    ['Speak & Spell', 22.5],
    ['Tamagotchi', 15],
    ['Connect Four', 7.88],
  ]
}
*/

const suite = create(data => {
  test.each(data.products)(
    name => name,
    'Price must be numeric and above zero.',
    (_, price) => {
      enforce(price).isNumeric().greaterThan(0);
    }
  );
});
```

**Read next about:**

- [Warn only tests](./warn).
- [Grouping tests](./group).
- [Asserting with enforce](./enforce).
- [Skipping or including tests](./exclusion).
