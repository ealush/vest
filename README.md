![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/vest-logo.png 'Vest')

# Vest - Validation Testing

[![npm version](https://badge.fury.io/js/vest.svg)](https://badge.fury.io/js/vest) [![Build Status](https://travis-ci.org/ealush/vest.svg?branch=master)](https://travis-ci.org/ealush/vest) [![Known Vulnerabilities](https://snyk.io/test/npm/vest/badge.svg)](https://snyk.io/test/npm/vest)

- [Documentation homepage](https://ealush.github.io/vest)
- **Try vest live**
  - [Vanilla JS Example](https://stackblitz.com/edit/vest-vanilla-support-example?file=validation.js)
  - ReactJS Examples:
    - [Example 1 (groups)](https://codesandbox.io/s/ecstatic-waterfall-4i2ne?file=/src/validate.js)
    - [Exmaple 2 (Async)](https://codesandbox.io/s/youthful-williamson-loijb?file=/src/validate.js)
    - [Example 3](https://stackblitz.com/edit/vest-react-support-example?file=validation.js)
    - [Example 4](https://stackblitz.com/edit/vest-react-registration?file=validate.js)
  - [VueJS Example](https://codesandbox.io/s/vest-vue-example-1j6r8?file=/src/validations.js)

## Tutorials

[Step By Step React Tutorial](https://dev.to/ealush/dead-simple-form-validation-with-vest-5gf8)

## [Release Notes](https://github.com/ealush/vest/releases)

## What is Vest?

Vest is a validations library for JS apps that derives its syntax from modern JS unit testing frameworks such as Mocha or Jest. It is easy to learn due to its use of already common declarative patterns.
It works great with user-input validation and with validating upon user interaction to provide the best possible user experience.

The idea behind Vest is that your validations can be described as a 'spec' or a contract that reflects your form or feature structure. Your validations run in production, and they are framework agnostic - meaning Vest works well with React, Angular, Vue, or even without a framework at all.

Using Vest for form validation can reduce bloat, improve feature redability and maintainability.

## Vest's features

- ✅ - Declarative validation style
- ✅ - Framework agnostic
- ✅ - Rich, extendable, assertions library (enforce)
- ✅ - Possibility to add multiple validations for the same field
- ✅ - Warning (non failing) validations, such as password strength
- ✅ - Easy to use result selecters (hasErrors, getErrors, hasWarnings...)
- ✅ - Only validate fields the user is interacting with (or the whole field)
- ✅ - Memoize async validations to reduce calls to the server
- ✅ - Test grouping for multi step forms

## Example code ([see sandbox](https://codesandbox.io/s/vest-react-tutorial-finished-ztt8t?file=/src/validate.js))

![Full form example](https://cdn.jsdelivr.net/gh/ealush/vest@assets/demos/full_1.gif 'Full form example')
![Full form example](https://cdn.jsdelivr.net/gh/ealush/vest@assets/demos/full.jpg 'Full form example')

### Memoized validations demo:

![memo](https://cdn.jsdelivr.net/gh/ealush/vest@assets/demos/memo.gif 'memo')

## Why Vest?

- Vest is really easy to learn. You can take your existing knowledge of unit tests and transfer it to validations.
- Vest takes into account user interaction and warn only validations.
- Your validations are structured, making it very simple to read and write. All validation files look the same.
- Your validation logic is separate from your feature logic, preventing the spaghetti code that's usually involved with writing validations.
- Validation logic is easy to share and reuse across features.
- If your backend is node, you can use the same Vest modules for both client-side and server-side validations.

**Vest is an evolution of [Passable](https://github.com/fiverr/passable) by Fiverr.**
