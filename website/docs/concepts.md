---
sidebar_position: 2
title: Vest's core concepts
description: Understand the core concepts of Vest and how it differs from other validation libraries.
keywords: [Vest, Core concepts, Farmework Agnostic, Validation, Suite]
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
