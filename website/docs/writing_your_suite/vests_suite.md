---
sidebar_position: 1
title: The Suite Object
description: Understanding the Vest Suite Object, its methods, and how to manage validation state.
keywords: [Vest, Suite, Validation, State Management, create, run, reset]
---

# The Suite Object

In the [Getting Started](../get_started.md) guide, we saw that `create()` returns a **Suite Object**. This object is your main interface for interacting with validations. It holds the state, runs the tests, and gives you the results.

import SuiteMethodsSandpack from '@site/src/components/Sandpack/SuiteMethods';

<SuiteMethodsSandpack />

## Running Validations

The most common method you'll use is `.run()`. It executes the callback you passed to `create`.

```javascript
const result = suite.run(formData, 'username');
```

:::note Async & Promises
If your suite contains async tests (like checking a database), `.run()` returns a **Result Object** that also behaves like a **Promise**.
You can `await suite.run(data)` to wait for all async operations to finish.
Check out the **[Async Tests](../writing_tests/async_tests.md)** guide for details.
:::

## Passing Arguments

You aren't limited to just passing `data`. Whatever arguments you pass to `.run()` are forwarded directly to your suite callback. This is great for handling "modes" or "steps" in multi-step forms.

```javascript
const suite = create((data, currentStep) => {
  if (currentStep === 'billing') {
    // only validate billing fields
  }
});

// Pass the step name as the second argument
suite.run(formData, 'billing');
```

## Stateless Validation (Server-Side)

If you are running Vest on the server (Node.js, Deno, etc.), you usually don't want the suite to "remember" the previous request. You want a fresh start for every API call.

Use `.runStatic()` for this. It runs the suite, returns the result, and immediately discards the state.

```javascript
// Perfect for API handlers
app.post('/register', (req, res) => {
  const result = suite.runStatic(req.body);

  if (result.hasErrors()) {
    return res.status(400).json(result.getErrors());
  }
});
```

## Managing State

Vest is "stateful" by default. This means if you run validation for just _one_ field, Vest remembers the results of the _other_ fields from the previous run. This is excellent for Single Page Applications (SPAs) where you don't want to lose existing errors just because the user updated a different input.

However, sometimes you need to intervene manually.

### Resetting the Suite

If a user clears the form or navigates away, you might want to wipe the slate clean.

```javascript
// Clears all results, errors, and warnings
suite.reset();
```

### Resetting a Single Field

To clear errors for just one field (useful if you want to implement a "reset input" button):

```javascript
suite.resetField('email');
```

### Removing a Field

If a field is dynamically removed from your UI (like removing a row in a list), you should remove it from the validation state so `isValid()` doesn't get stuck waiting for it.

```javascript
suite.remove('passenger_2');
```

## Accessing Results Without Running

Sometimes you need to check the validity of the form _without_ triggering a new run (e.g., to disable a submit button).

```javascript
const result = suite.get();
```

This returns the most recent result object instantly.

## Advanced: SSR & Hydration

If you are rendering on the server and hydrating on the client (Next.js, Remix, Nuxt), you can transfer Vest's state so the client picks up exactly where the server left off.

We use the `SuiteSerializer` API for this.

```javascript
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

// 1. Server: Serialize the suite after running
const result = suite.runStatic(formData);
const serializedState = SuiteSerializer.serialize(result);

// 2. Client: Resume the suite with that state
SuiteSerializer.resume(suite, serializedState);
```

For a deep dive into this pattern, read **[Server-Side Rendering & Hydration](../suite_serialization.md)**.
