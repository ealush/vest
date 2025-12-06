---
sidebar_position: 2
title: Vest's core concepts
description: Understand the core concepts of Vest and how it differs from other validation libraries.
keywords:
  [Vest, Core concepts, Framework Agnostic, Validation, Suite, Mental Model]
---

## Introduction

Vest is a form validation framework designed to simplify and optimize form validations in JavaScript. Inspired by the syntax and style of popular unit testing tools like Mocha and Jest, using Vest will feel familiar to developers who have experience with those tools.

**If you know Jest, you already know Vest.**

## The Mental Model

The key insight behind Vest is that **validations are just tests**. Instead of mixing validation logic into your UI components, Vest lets you write it in a separate file using the same patterns you'd use for unit tests.

### The Suite as a "Living Result"

Think of a Suite as more than just a function - it's an **object that holds the truth about your data validity**. When you call `suite.run()`:

1. Vest executes your validation tests
2. It stores the results internally
3. It merges new results with previous field results
4. It returns a result object with everything you need

```
┌─────────────────────────────────────────────────────────┐
│                      Your Suite                          │
├─────────────────────────────────────────────────────────┤
│  User types in "Username"                                │
│           ↓                                              │
│  suite.focus({ only: 'username' }).run(data)            │
│           ↓                                              │
│  Vest runs ONLY "Username" tests                         │
│           ↓                                              │
│  Vest MERGES result with previous "Password" result      │
│           ↓                                              │
│  UI receives COMPLETE validation picture                 │
└─────────────────────────────────────────────────────────┘
```

This is why Vest is so fast for form validation - it only runs what's needed while keeping the full picture intact.

## Core Concepts

### Validation Suites

With Vest, you define your form validations in a validation suite, which is separate from your feature code. The suite is an object with methods such as `run`, `runStatic`, and `reset`, and it retains state between runs.

```js
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
});

// Execute the suite
const result = suite.run({ username: 'Dana' });

if (result.isValid()) {
  // Form is valid
}
```

### Stateful vs Stateless Validation

Vest offers two modes:

| Mode          | Method              | Use Case                                     |
| ------------- | ------------------- | -------------------------------------------- |
| **Stateful**  | `suite.run()`       | Client-side forms, SPAs, React/Vue/Svelte    |
| **Stateless** | `suite.runStatic()` | Server-side API validation, Lambda functions |

**Stateful** keeps results between runs - perfect for incrementally validating fields as users interact.

**Stateless** is a fresh start every time - perfect for API endpoints where each request is independent.

### Framework Agnostic

Since you write your validation suite outside of your feature code, and Vest retains its own state, you can use Vest with any framework you want. The same suite works with React, Vue, Svelte, Angular, or vanilla JS.

## Common Questions

### Can I run Vest in my production app?

Yes! Unlike testing libraries, Vest is designed to run in production. Although Vest looks like a testing framework, it is very conscious of your runtime in terms of performance and resources.

### Does Vest support asynchronous validations?

Yes, Vest supports asynchronous validations with built-in race condition handling. It provides utilities and mechanisms to handle asynchronous validations using promises or async/await syntax. [Read more on asynchronous validations](./writing_tests/async_tests.md).

### Is Vest compatible with form libraries?

Yes, Vest is compatible with various form libraries and UI frameworks. As a framework-agnostic validation library, it can be integrated into React Hook Form, Formik, Felte, and others via the **Standard Schema** support. [Read more](./community_resources/standard_schema.md).

### Does Vest support internationalization (i18n)?

Yes, Vest supports internationalization. Use your already localized/translated strings as your error messages - Vest doesn't impose any specific i18n solution.
