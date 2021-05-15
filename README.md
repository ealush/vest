![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/vest-logo.png 'Vest')

# Vest 🦺 Declarative Validation Testing

![Github Stars](https://githubbadges.com/star.svg?user=ealush&repo=vest&style=flat)
![Npm downloads](https://img.shields.io/npm/dt/vest?label=Downloads&logo=npm)

[![npm version](https://badge.fury.io/js/vest.svg)](https://badge.fury.io/js/vest) [![Build Status](https://travis-ci.org/ealush/vest.svg?branch=latest)](https://travis-ci.org/ealush/vest) [![Known Vulnerabilities](https://snyk.io/test/npm/vest/badge.svg)](https://snyk.io/test/npm/vest)
![minifiedSize](https://img.shields.io/bundlephobia/min/vest?color=blue&logo=npm)

[![Join discord](https://img.shields.io/discord/757686103292641312?label=Join%20Discord&logo=discord&logoColor=green)](https://discord.gg/WmADZpJnSe)

- [Documentation homepage](https://vestjs.dev)
- **Try vest live**
  - [Vanilla JS Example](https://stackblitz.com/edit/vest-vanilla-support-example?file=validation.js)
  - ReactJS Examples:
    - [Example 1 (groups)](https://codesandbox.io/s/ecstatic-waterfall-4i2ne?file=/src/validate.js)
    - [Example 2 (Async)](https://codesandbox.io/s/youthful-williamson-loijb?file=/src/validate.js)
    - [Example 3](https://stackblitz.com/edit/vest-react-support-example?file=validation.js)
    - [Example 4](https://stackblitz.com/edit/vest-react-registration?file=validate.js)
    - [Example 5 (Password validator)](https://codesandbox.io/s/password-validator-example-6puvy?file=/src/validate.js)
  - [VueJS Example](https://codesandbox.io/s/vest-vue-example-1j6r8?file=/src/validations.js)
  - [Svelte Example](https://codesandbox.io/s/vestdocssvelteexample-k87t7?file=/validate.js)

## Tutorials

[Step By Step React Tutorial](https://dev.to/ealush/dead-simple-form-validation-with-vest-5gf8)

## [Release Notes](https://github.com/ealush/vest/releases)

## 🦺 What is Vest?

Vest is a validations library for JS apps that derives its syntax from modern JS unit testing frameworks such as Mocha or Jest. It is easy to learn due to its use of already common declarative patterns.
It works great with user-input validation and with validating upon user interaction to provide the best possible user experience.

The idea behind Vest is that your validations can be described as a 'spec' or a contract that reflects your form or feature structure. Your validations run in production, and they are framework agnostic - meaning Vest works well with React, Angular, Vue, or even without a framework at all.

Using Vest for form validation can reduce bloat, improve feature readability and maintainability.

**Basic Example**
![full](https://cdn.jsdelivr.net/gh/ealush/vest@assets/demos/full_3.gif 'full')

**Memoized async test**
![memo](https://cdn.jsdelivr.net/gh/ealush/vest@assets/demos/memo.gif 'memo')

## ✅ Motivation

Writing forms is an integral part of building web apps, and even though it may seem trivial at first - as your feature grows over time, so does your validation logic grows in complexity.

Vest tries to remediate this by separating validation logic from feature logic so it is easier to maintain over time and refactor when needed.

## ✨ Vest's features

- 🎨 Framework agnostic (BYOUI)
- ⚡️ Rich, extendable, assertions library (enforce) ([doc](http://vestjs.dev/#/enforce))
- 🚥 Multiple validations for the same field
- ⚠️ Warning (non failing) tests ([doc](http://vestjs.dev/#/warn))
- 📝 Validate only the fields the user interacted with ([doc](http://vestjs.dev/#/exclusion))
- ⏳ Memoize async validations to reduce calls to the server ([doc](http://vestjs.dev/#/test?id=testmemo-for-memoized-tests))
- 🚦 Test grouping ([doc](http://vestjs.dev/#/group))

## Example code ([Run in sandbox](https://codesandbox.io/s/vest-react-tutorial-finished-ztt8t?file=/src/validate.js))

```js
import vest, { test } from 'vest';

export default vest.create('user_form', (data = {}, currentField) => {
  vest.only(currentField);

  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  test('username', 'Username is too short', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', 'Password must be at least 6 chars long', () => {
    enforce(data.password).longerThanOrEquals(6);
  });

  test('password', 'Password is weak, Maybe add a number?', () => {
    vest.warn();
    enforce(data.password).matches(/[0-9]/);
  });

  if (data.password) {
    test('confirm_password', 'Passwords do not match', () => {
      enforce(data.confirm_password).equals(data.password);
    });
  }

  test('email', 'Email Address is not valid', () => {
    enforce(data.email).isEmail();
  });

  test('tos', () => {
    enforce(data.tos).isTruthy();
  });
});
```

## Why Vest?

- 🧠 Vest is really easy to learn. You can take your existing knowledge of unit tests and transfer it to validations.
- ✏️ Vest takes into account user interaction and warn only validations.
- 🧱 Your validations are structured, making it very simple to read and write. All validation files look the same.
- 🖇 Your validation logic is separate from your feature logic, preventing the spaghetti code that's usually involved with writing validations.
- 🧩 Validation logic is easy to share and reuse across features.

**Vest is an evolution of [Passable](https://github.com/fiverr/passable) by Fiverr.**
