---
sidebar_position: 1
title: The Test Function
description: The test function is the main function in Vest that holds your validation logic.
keywords: [Test, Validation, Logic]
---

# The Test Function

The `test` function represents a single case in your validation suite. It accepts the following arguments:

| Name       | Type       | Optional | Description                                                           |
| ---------- | ---------- | -------- | --------------------------------------------------------------------- |
| `name`     | `String`   | No       | The name of the value or field that is validated.                     |
| `message`  | `String`   | Yes      | An error message to display to the user in case of a failure.         |
| `callback` | `Function` | No       | The actual validation logic for the given test.                       |
| `key`      | `String`   | Yes      | A unique key used to retain test value when reordering dynamic tests. |

A test can either be synchronous or asynchronous, and it can either have a severity of `error` or of `warn`.

:::tip
The test function is very similar to a unit test's `it` or `test` function, with some additions.
:::

## How to fail a test?

### Throwing inside your test body (using enforce)

Just like in most unit testing frameworks, a validation fails whenever the test body throws an exception. enforce throws an error on failed validations.
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

Read more in the next section on async tests.
