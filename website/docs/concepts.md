---
sidebar_position: 2
title: Vest's core concepts
description: Understand the core concepts of Vest and how it differs from other validation libraries.
keywords: [Vest, Core concepts, Framework Agnostic, Validation, Suite]
---

## Introduction

Vest is a form validation framework designed to simplify and optimize form validations in JavaScript. Inspired by the syntax and style of popular unit testing tools like Mocha and Jest, using Vest will feel familiar to developers who have experience with those tools. However, Vest has some unique features that make it more suitable for form validation.

## Core Concepts

### Validation Suites

With Vest, you define your form validations in a validation suite, which is separate from your feature code. The validation suite is where all the validations of a given form reside. The suite returns a function that can take in any data you have in your form. Here's an example:

```js
import { create } from 'vest';

const suite = create((data = {}) => {
  // Your validations go here
});
```

### Stateful Validation

When you create a validation suite, Vest also initializes a suite-state where the current validation results are stored. This suite-state is merged with the next suite-state when the suite is run. This approach allows for very performant validations of only the field the user is interacting with, and not the entire form. [Read more on validation state](./understanding_state.md).

### Framework Agnostic

Since you write your validation suite outside of your feature code, and Vest retains its own state, you can use Vest with any framework you want. Vest only requires a limited interface with your feature code.

## Common Questions

### Can I run Vest in my production app?

Yes! Unlike testing libraries, Vest is designed to run in production. Although Vest looks like a testing framework, it is very conscious of your runtime in terms of performance and resources.

### Does Vest support asynchronous validations?

Yes, Vest supports asynchronous validations. It provides utilities and mechanisms to handle asynchronous validations using promises or async/await syntax. Users can include asynchronous logic within their validation rules. [Read more on asynchronous validations](./writing_tests/async_tests.md).

### Can I customize the error messages in Vest?

Yes, Vest allows customization of error messages. There are multiple ways you can customize error messages in Vest. [Read more on customizing error messages](./writing_tests/failing_with_a_custom_message.md).

### Is Vest compatible with form libraries or UI frameworks?

Yes, Vest is compatible with various form libraries and UI frameworks, including popular ones like React, Vue.js, and Angular. As a framework-agnostic validation library, Vest can be integrated into any JavaScript framework seamlessly. Developers can incorporate Vest's validation logic into their form components and leverage the benefits of Vest alongside their chosen form library or UI framework.

### Does Vest support internationalization (i18n)?

Yes, Vest supports internationalization. Developers can handle internationalization requirements by leveraging the existing localization mechanisms of their chosen framework or by implementing custom approaches. All you need to do is use your already localized/translated strings as your error messages.
