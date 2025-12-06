---
sidebar_position: 1
title: Getting Started with Vest
description: Learn the basics of Vest validation. Install the library, create your first suite, and run validations in minutes.
keywords: [Vest, Tutorial, Validation, JavaScript, React, Vue, Svelte]
---

# Getting Started

Welcome to Vest! If you've used unit testing frameworks like Jest or Mocha, you already know how to use Vest.

Vest takes that familiar syntax—`test`, `describe` (we call it `suite`), and assertions—and brings it to your form validation logic.

## Why Vest?

Most validation libraries force you to write validation logic _inside_ your UI components. This makes your components messy, hard to read, and difficult to test.

**Vest is different.** It lets you write your validation logic in a separate file, just like a unit test.

- **Clean Components:** Your UI code only handles UI. Your validation code only handles validation.
- **Framework Agnostic:** Use the same suite with React, Vue, Svelte, or vanilla JS.
- **Easy to Test:** Since your validation is just a JS function, you can unit test it in isolation.

## Installation

```shell
npm i vest
```

## 1. Write Your Suite

Think of a **Suite** as the brain of your form. It holds all the validation rules for a specific feature. Unlike other libraries where you define a static schema JSON, in Vest, you write a function using standard control flow (if/else, loops).

Create a file named `formValidation.js`:

```javascript
import { create, test, enforce } from 'vest';

// The suite function holds your validation logic.
// It receives whatever data you pass to 'suite.run()' later.
const suite = create((data = {}) => {
  // Check if 'username' exists
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  // You can verify multiple rules for the same field.
  // This test only runs if the previous one passed.
  test('username', 'Username must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });

  // Simple conditional logic
  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });
});

export default suite;
```

:::tip Pro Tip
Vest runs tests sequentially for a given field. If the first 'username' test fails, the second one won't run. This prevents "error overload" for your users.
:::

## 2. Run the Suite

In your UI component (React, Svelte, etc.), import your suite.

The `create` function returns a **Suite Object**. To validate data, you call the `.run()` method on that object.

```javascript
import suite from './formValidation';

// 1. Run the validation with your form data
const result = suite.run({ username: 'Jo' });

// 2. Check the result
if (result.hasErrors('username')) {
  console.log('Username is too short!');
  // Output: "Username must be at least 3 chars"
}

if (result.isValid()) {
  console.log('Form is valid! Ready to submit.');
}
```

The `result` object is your dashboard. It tells you everything you need to know about the validation state.

:::note Notice something?
Your validation logic is completely outside your component. That's the power of Vest. Your component stays clean, and your validation is easy to test.
:::

## Next Steps

- **[Handling User Interaction](./writing_your_suite/dirty_checking.md)**: Learn how to show errors only when a user interacts with a field.
- **[Async Tests](./writing_tests/async_tests.md)**: Need to check a username against a database? See how to handle async validations.
- **[The Suite Object](./writing_your_suite/vests_suite.md)**: Dive deeper into the Suite Object capabilities (`reset`, `remove`, `get`).
