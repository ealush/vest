---
sidebar_position: 1
title: Getting Started with Vest
description: Build progressive validation that runs only what changed, retains previous results, and handles async work safely.
keywords: [Vest, Tutorial, Stateful Validation, JavaScript, React, Vue, Svelte]
---

# Getting Started

Vest is a **stateful validation runtime for complex forms and progressive workflows**.

It validates the field or step changing now, retains trustworthy results from earlier runs, and prevents obsolete asynchronous work from corrupting current validation state.

If you know Jest or Mocha, the authoring model will feel familiar: define a suite of named tests and use assertions to express the rules. The test-like syntax makes Vest approachable; its persistent validation runtime is what makes it different.

import GetStartedSandpack from '@site/src/components/Sandpack/GetStarted';

## The problem Vest solves

Interactive validation is not a one-time parse. A real form unfolds over time:

1. The user changes one field.
2. Only the related rules should run.
3. Results for other fields should remain available.
4. Dependent fields may need to be reconsidered.
5. Async responses may arrive in the wrong order.
6. The complete workflow still needs one reliable validation result.

Vest owns that process without owning your form values, DOM, or UI components.

## Installation

```shell
npm i vest
```

## Create a suite

```js
import { create, enforce, test } from 'vest';

export const signupSuite = create((data = {}) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('username', 'Username must be at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('username', 'Username is already taken', async ({ signal }) => {
    const response = await checkUsername(data.username, { signal });
    enforce(response.available).isTruthy();
  });
});
```

The suite is independent from React, Vue, Svelte, Angular, or any other UI layer. It contains the validation contract; your feature decides when to run it and how to render the result.

## Run only what changed

```js
const result = signupSuite.only('username').run(formData);

result.isPending('username');
result.hasErrors('username');
result.getError('username');
```

`suite.only('username')` runs only username tests. Results previously established for `email` and other fields remain in the suite, so `result.isValid()` still represents the complete validation picture.

Run the full suite before submission:

```js
const result = await signupSuite.run(formData);

if (result.isValid()) {
  submit(formData);
}
```

When async tests exist, the returned result exposes synchronous selectors immediately and can also be awaited for final completion.

## Interactive example

This example connects a stateful Vest suite to a React form. The suite itself is framework-independent.

<GetStartedSandpack />

## Test the suite without a UI

Use `runStatic()` when a test should not inherit state from an earlier case:

```js
const passwordSuite = create(data => {
  test('password', 'Password must contain at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});

const invalid = passwordSuite.runStatic({ password: 'short' });
expect(invalid.hasErrors('password')).toBe(true);
```

The test exercises the same rules as the UI without rendering a component. Interactive application code should still use stateful `run()` so focused results can accumulate over time.

## When Vest is a strong fit

Use Vest when validation behavior includes:

- async username, email, eligibility, inventory, or coupon checks;
- multi-step onboarding and wizards;
- fields that depend on other fields;
- optional or conditional sections;
- dynamic lists of travelers, products, or addresses;
- errors, warnings, pending states, and progressive completion;
- validation shared between browser and server.

For a one-shot API boundary parse, a schema validator may be all you need. A common architecture is to use a schema validator for the submitted payload and Vest for the interactive journey that produces it.

## Next steps

- **[Follow the ten-tutorial learning path](./tutorials.md)**: Build from a basic suite through async state, schemas, server validation, and custom rules.
- **[Understand Vest's living result](./concepts.md)**: Learn the stateful runtime mental model.
- **[Async validation without stale results](./writing_tests/async_tests.md)**: Coordinate overlapping server checks safely.
- **[Focused updates](./writing_your_suite/focused_updates.md)**: Validate one field, step, or group.
- **[Dependent fields](./writing_your_suite/including_and_excluding/include.md)**: Rerun related rules together.
- **[Server validation and resumption](./suite_serialization.md)**: Continue server validation state in the client.
