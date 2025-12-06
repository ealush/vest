---
sidebar_position: 1
title: Getting Started with Vest
description: Learn the basics of Vest validation. Install the library, create your first suite, and run validations in minutes.
keywords: [Vest, Tutorial, Validation, JavaScript, React, Vue, Svelte]
---

# Getting Started

Welcome to Vest! If you've used unit testing frameworks like Jest or Mocha, you already know how to use Vest.

import GetStartedSandpack from '@site/src/components/Sandpack/GetStarted';

Vest takes that familiar syntax - `test`, `describe` (we call it `suite`), and assertions - and brings it to your form validation logic.

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

## Interactive Example

Here is a complete, interactive example connecting a Vest suite to a React form. You can edit the code to see how Vest behaves!

<GetStartedSandpack />

:::note Notice something?
Your validation logic is completely outside your component. That's the power of Vest. Your component stays clean, and your validation is easy to test.
:::

## Next Steps

- **[Handling User Interaction](./writing_your_suite/dirty_checking.md)**: Learn how to show errors only when a user interacts with a field.
- **[Async Tests](./writing_tests/async_tests.md)**: Need to check a username against a database? See how to handle async validations.
- **[The Suite Object](./writing_your_suite/vests_suite.md)**: Dive deeper into the Suite Object capabilities (`reset`, `remove`, `get`).
