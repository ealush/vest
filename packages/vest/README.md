![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/vest-logo.png 'Vest')

# Vest - Validation Testing

[![npm version](https://badge.fury.io/js/vest.svg)](https://badge.fury.io/js/vest) [![Build Status](https://travis-ci.org/ealush/vest.svg?branch=master)](https://travis-ci.org/ealush/vest) [![Known Vulnerabilities](https://snyk.io/test/npm/vest/badge.svg)](https://snyk.io/test/npm/vest)

- [Documentation homepage](https://ealush.github.io/vest)
- **Try vest live**
  - [Vanilla JS example](https://stackblitz.com/edit/vest-vanilla-support-example)
  - ReactJS Examples: [1](https://stackblitz.com/edit/vest-react-support-example), [2](https://stackblitz.com/edit/vest-react-registration)

## What is Vest?

Vest is a validations library for JS apps that derives its syntax from modern JS frameworks such as Mocha or Jest. It is easy to learn due to its use of already common declarative patterns.
It works great with user-input validation and with validating upon user interaction to provide the best possible user experience.

The idea behind Vest is that your validations can be described as a 'spec' or a contract that reflects your form or feature structure. Your validations run in production, and they are framework agnostic - meaning Vest works well with React, Angular, Vue, or even without a framework at all.

**Example code:**

```js
// validation.js
import vest, { test, enforce } from 'vest';

const validate = vest.create('NewUserForm', data => {
  test('username', 'Must be at least 3 chars', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('email', 'Is not a valid email address', () => {
    enforce(data.email)
      .isNotEmpty()
      .matches(/[^@]+@[^\.]+\..+/g);
  });
});

export default validate;
```

```js
// myFeature.js
import validate from './validation.js';

const res = validate({
  username: 'example',
  email: 'email@example.com',
});

res.hasErrors(); // returns whether the form has errors
res.hasErrors('username'); // returns whether the 'username' field has errors
res.getErrors(); // returns an object with an array of errors per field
res.getErrors('username'); // returns an array of errors for the `username` field
```

## Why Vest?

- Vest is really easy to learn, and you can easily take your existing knowledge of unit tests and transfer it to validations.
- Vest takes into account user interaction and warn only validations.
- Your validations are structured, making it very easy to read and write. All validation files look the same.
- Your validation logic is separate from your feature logic, preventing the spaghetti code that's usually involved with writing validations.
- Validation logic is easy to share and reuse across features.
- If your backend is node, you can use the same Vest modules for both client-side and server-side validations.

**Vest is a continuation of [Passable](https://github.com/fiverr/passable) by Fiverr.**

Vest icon made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/).
