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

### Throwing an errorr inside your test body (using enforce)

Just like in most unit testing frameworks, a validation fails whenever an error is thrown inside the test body. The [`enforce`](./enforce) function throws an error whenever the enforced value does not meet the specified criteria.

```js
// const username = 'Gina.Vandervort';
// const password = 'Q3O';

test("username", "Should be at least 3 charachters long", () => {
  enforce(username).longerThanOrEquals(3);
}); // this test passes

test("password", "Should be at least 6 charachters long", () => {
  enforce(password).longerThanOrEquals(6); // an error is thrown here
}); // this test fails
```

### Explicitly returning false

To make it easy to migrate your existing validation logic into Vest, it also supports validations explicitly returning `false` (and not any other falsy value) to represent failures.

```js
// const username = 'Gina.Vandervort';
// const password = 'Q3O';

test("username", "Should be at least 3 charachters long", () => {
  return username.length >= 3; // = true
}); // this test passes

test("password", "Should be at least 6 charachters long", () => {
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
test("name", "I always fail", () => Promise.reject());

// Example using async/await
test("name", "Should be unique", async () => {
  return await doesUserExist(user);
});
```

### Rejecting with a message

When performing validations on the server, your server might need to respond with different error messages. When rejecting with a string value, your string value will be picked up as the message to show to the user.

```js
test("name", () =>
  new Promise((resolve, reject) => {
    fetch(`/checkUsername?name=${name}`)
      .then((res) => res.json)
      .then((data) => {
        if (data.status === "fail") {
          reject(data.message); // rejects with message and marks the test as failing
        } else {
          resolve(); // completes. doesn't mark the test as failing
        }
      });
  }));
```

**Read next about:**

- [Warn only tests](./warn).
- [Asserting with enforce](./enforce).
- [Skipping or including tests](./exclusion).
- [Accessing intermediate suite result](./draft).
