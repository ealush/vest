---
sidebar_position: 3
title: Failing with a custom message
description: Sometimes we wish to fail with a message based on the validation result. Here's how we can do this.
keywords: [Vest, custom, message, failing, with, message]
---

# Failing with a custom message

Sometimes your validation logic might result in different failure reasons that are unknown before you run the test. In this case the message argument is not as useful, and instead you should omit it. Vest allows you to provide the message within the test body itself by doing one of the following:

## Throwing a string

If the message param is omitted, and the test throws a string value, the string will be used as the test's message:

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
