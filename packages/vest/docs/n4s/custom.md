# Creating Custom Rules

To make it easier to reuse logic across your application, sometimes you would want to encapsulate bits of logic in rules that you can use later on, for example, "what's considered a valid email".

Rules are called with the argument passed to enforce(x) followed by the arguments passed to `.yourRule(y, z)`.

```js
enforce.extend({
  yourRule(x, y, z) {
    return {
      pass: true,
      message: () => '',
    };
  },
});
```

```js
enforce.extend({
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, key) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
});

enforce(user.email).isValidEmail();
```

## Custom rules return value

Rules can either return boolean indicating success or failure, or an object with two keys. `pass` indicates whether the validation is successful or not, and message provides a function with no arguments that return an error message in case of failure. Thus, when pass is false, message should return the error message for when enforce(x).yourRule() fails.

```js
enforce.extend({
  isWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

This is useful when combind with Vest tests, because vest test can use the string value as the test message:

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
