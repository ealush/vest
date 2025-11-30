---
sidebar_position: 1
title: Getting Started with Vest
description: Learn the basics of Vest validation. Install the library, create your first suite, and run validations in minutes.
keywords: [Vest, Tutorial, Validation, JavaScript, React, Vue, Svelte]
---

# Getting Started

Welcome to Vest! If you've used unit testing frameworks like Jest or Mocha, you're already halfway there. Vest takes that familiar syntax—`test`, `describe` (we call it `suite`), and assertions—and brings it to your form validation logic.

In this guide, we'll build a simple validation suite for a user registration form.

## Installation

First, grab the package from npm:

```shell
npm i vest
```

## Your First Suite

Think of a **Suite** as the brain of your form. It holds all the validation rules for a specific feature. Unlike other libraries where you define a schema JSON, in Vest, you write a function.

Here's a basic registration suite. We want to ensure the username is present and at least 3 characters long.

```javascript
import { create, test, enforce } from 'vest';

// 1. We create the suite and pass it a callback function.
// This callback will run every time we validate our form.
const suite = create((data = {}) => {
  // 2. We define a test for the 'username' field.
  test('username', 'Username is required', () => {
    // 3. We use 'enforce' to check the data.
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });
});

export default suite;
```

:::tip Pro Tip
You can define multiple tests for the same field (like 'username' above). Vest runs them sequentially. If the first one fails, the second one won't run, saving you from showing multiple errors for the same issue.
:::

## Running the Suite

Now that we've defined the rules, how do we use them?

In Vest 6, the `create` function returns a **Suite Object**. To validate data, you call the `.run()` method on that object.

```javascript
import suite from './suite';

// Let's try running it with invalid data
const result = suite.run({ username: 'Jo' });
```

The `result` object is your dashboard. It tells you everything you need to know about the validation state:

```javascript
// Check if a specific field has errors
if (result.hasErrors('username')) {
  console.log('Username is too short!');
}

// Check if the whole form is valid
if (result.isValid()) {
  console.log('Ready to submit!');
}
```

### What's Next?

- **[Vest's Suite Structure](./writing_your_suite/vests_suite.md)**: Dive deeper into the Suite Object and its capabilities.
- **[Writing Tests](./writing_tests/the_test_function.md)**: Learn about the `test` function arguments and behaviors.
- **[Async Tests](./writing_tests/async_tests.md)**: Need to check a username against a database? See how to handle async validations.
