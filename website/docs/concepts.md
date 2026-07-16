---
sidebar_position: 2
title: How Vest Handles Validation
description: See what a Vest suite remembers between runs and why that matters for interactive forms.
keywords:
  [Vest, Stateful Validation, Progressive Validation, Validation Suite, Async]
---

# How Vest Handles Validation

Most validators inspect a value and return an answer. Vest can do that too, but a suite can also keep its result between runs.

A schema validator usually answers:

> Does this value match the required structure right now?

An interactive form has a few more questions:

> What changed? Which rules need to run again? Can the other results stay as they are? Is this async response still current? Can the user continue?

Those questions come up in forms, onboarding, checkout flows, settings screens, and anywhere validation happens a little at a time.

## What a suite gives you

### 1. Executable business rules

Vest treats validations as named tests:

```js
import { create, enforce, test } from 'vest';

const suite = create(data => {
  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('password', 'Password must contain a number', () => {
    enforce(data.password).matches(/\d/);
  });
});
```

The familiar syntax is valuable because it gives validation logic a consistent structure. Rules live outside UI components, support multiple tests per field, and can be unit-tested without simulating DOM events.

### 2. One result that updates over time

A suite keeps the latest result for every test it has seen.

When `suite.run()` executes, Vest:

1. runs the relevant tests;
2. records passing, failing, warning, and pending outcomes;
3. reconciles them with previous runs;
4. ignores results that are no longer relevant;
5. returns the complete current validation picture.

```text
Password changes
  → run password tests
  → retain the earlier email result

Username changes
  → run username tests
  → retain password and email
  → ignore an older username request if it finishes late
```

The result is still complete even when the latest run only checked one field.

### 3. Assertions, schemas, and integration

`enforce` provides assertions, schemas, parsing, and custom rules. Vest suites and Enforce rules also implement Standard Schema for interoperability with compatible tools.

The schema checks and parses the input. The suite then keeps track of test results as the user interacts with the form.

## Validation state, not form state

Vest deliberately does not own:

- input values;
- DOM nodes;
- field registration;
- UI events;
- submission transport.

It owns:

- which validation tests ran;
- which passed, failed, warned, or are pending;
- which fields and groups are valid;
- which results were retained, skipped, omitted, or canceled;
- whether the workflow as a whole is ready.

This makes Vest compatible with local component state, React Hook Form, Formik, server actions, custom state machines, or no form library at all.

## Stateful and stateless execution

| Mode          | Method              | Best for                                 |
| ------------- | ------------------- | ---------------------------------------- |
| **Stateful**  | `suite.run()`       | Interactive forms and progressive flows  |
| **Stateless** | `suite.runStatic()` | API requests and independent server runs |

Stateful runs merge new results into the suite. Stateless runs start fresh and discard state after producing the result.

For SSR applications, Vest can serialize a stateless server result and resume it in a stateful browser suite. That preserves more context than sending an error object alone.

## Focused execution

```js
suite.only('username').run(data);

suite.focus({ onlyGroup: 'shipping' }).run(data);

suite.focus({ skip: 'promoCode', skipGroup: 'billing' }).run(data);
```

Focused runs apply to the next execution only. Fields that do not run retain their previous results.

This improves:

- **performance** by avoiding irrelevant work;
- **user experience** by not exposing errors for untouched fields;
- **correctness** by preserving the full validation picture;
- **cost** by not repeating heavy computations or server requests.

## Async validation is a concurrency problem

Supporting promises is not enough for interactive validation. Requests can overlap and finish in a different order than they started.

Vest associates async tests with their validation run. When a field runs again, older work is canceled and its eventual result cannot replace the newer state. Tests receive an `AbortSignal` so network operations can stop early when possible.

The result exposes pending state immediately:

```js
const result = suite.only('username').run(data);

result.isPending('username'); // available immediately
await result; // wait for the current run to finish
```

## Dependent and conditional workflows

Real workflows are rarely independent field maps. Vest includes primitives for relationships and changing structure:

- `include(field).when(...)` reruns dependent fields;
- `group()` represents steps or logical sections;
- `skipWhen()` avoids work while retaining validity requirements;
- `omitWhen()` removes currently irrelevant tests from validity;
- `optional()` represents values that may be absent;
- `each()` tracks dynamic list items with stable keys;
- warnings provide guidance without blocking completion.

These tools describe relationships between tests, not just the shape of a value.

## Errors are not the same as incompleteness

A suite may not be valid yet because:

- a required field has not been tested;
- an async test is pending;
- a required section has not been reached.

That is different from an active validation error. Vest exposes `isTested`, `isPending`, errors, and warnings separately so the UI can respond without treating an unfinished user as a failing user.

## Framework independence

Because suites do not depend on UI components, the same validation contract can be used with React, Vue, Svelte, Angular, vanilla JavaScript, or Node.js.

Your framework decides when to run the suite and how to show its result. Vest keeps track of the validation itself.

## In short

Vest's test-like syntax is familiar, but the state kept by the suite is the important part.

It lets you validate what changed without forgetting what already passed, and it prevents an old async response from overwriting a newer result.

Continue with [Understanding Vest's State](./understanding_state.md) or see [Vest alongside schema and form libraries](./vest_vs_the_rest.md).
