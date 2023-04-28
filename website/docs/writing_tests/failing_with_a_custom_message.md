---
sidebar_position: 3
title: Failing with a custom message
description: Sometimes we wish to fail with a message based on the validation result. Here's how we can do this.
keywords:
  [Vest, custom message, failing, validation, error message, enforce, test]
---

# Failing with a custom message

Custom messages can be very useful when you don't know the validation result in the client, but get it from the server instead. This can happen when you're performing validation on user input and sending it to a server for processing. If there's an issue with the input, the server will send back a validation result, but it may not be immediately clear what went wrong. This is where custom messages can help.

# Implementing Custom Messages in Vest

Vest allows you to provide custom messages within the test body itself. There are a few different ways to do this:

## Enforce message

The `enforce` function in Vest allows you to pass a custom message using the `message` modifier. This can be useful if you have multiple failure conditions.

The message must be specified before the rule it refers to, because once the rule failes, enforce throws immediately.

```js
test('username', () => {
  enforce(data.username)
    .message('Username is required')
    .isNotBlank()
    .message('Username must be at least 3 characters')
    .longerThan(2);
});
```

## Throwing a string

If the message parameter is omitted, and the test throws a string value, the string will be used as the test's message. This can be useful if you want to provide a custom message for a specific validation rule.

```js
test('price', () => {
  if (price < 0) {
    throw 'Price must be positive';
  }
});
```

```js
enforce.extend({
  isPositive: value => {
    return {
      pass: value > 0,
      message: () => 'value must be positive',
    };
  },
});

test('price', () => {
  enforce(price).isPositive(); // will fail with the message: "value must be positive"
});
```

## Rejecting with a string

Async tests can reject their promise with the string as well:

```js
test('price', () => {
  return apiCall().then(() => {
    throw 'Price must be positive';
  });
});

test('price', () => {
  return Promise.reject('Price must be positive');
});
```
