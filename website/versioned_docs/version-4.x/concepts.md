---
sidebar_position: 2
title: Vest's core concepts
description: Understand the core concepts of Vest and how it differs from other validation libraries.
keywords: [Vest, Core concepts, Framework Agnostic, Validation, Suite]
---

# Core Concepts

Vest is a form validations framework inspired by the syntax and style of unit testing tools like Mocha or Jest, so naturally, using Vest will feel familiar. Under the hood, though, Vest has some differences that make it more suitable for use with form validation.

## Validations are written in a Vest suite

Separate from your feature code, you can define a validation suite. The suite is where the validations of a given form reside. The suite returns a function, and you can pass it whatever data you have in your form.

```js
import { create } from 'vest';

const suite = create((data = {}) => {
  // Your tests are here
});
```

## Vest is stateful

When you create a suite, it also initializes a suite-state. The suite-state is where the current validation results are stored, and it is merged with the next suite-state when the suite is run. This allows for very performant validations of just the field the user is interacting with.

## Vest is framework agnostic

Because you write your validation suite outside of your feature code, and Vest retains its own state, you can use Vest with any framework you want, only requiring a limited interface with your feature code.

# Common Questions

### Can I run Vest in my production app?

Unlike testing libraries, Vest runs in production. Vest does look like a testing framework, but it is also very conscious of your runtime in terms of performance and resources.
