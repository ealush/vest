# Vest 6 — Consumer Usage Guide

Vest is a framework-independent, stateful validation runtime for complex forms and progressive workflows.

Use Vest when validation unfolds over time: only some fields should run, earlier results must remain available, fields depend on one another, or async checks can overlap.

Full documentation: https://vestjs.dev/docs/get_started

## The core model

- A **suite** contains executable validation rules.
- `suite.run(data)` performs a stateful run and reconciles it with previous results.
- `suite.only(field).run(data)` runs one field while retaining other field results.
- `suite.runStatic(data)` performs an independent stateless run, usually on the server.
- The result distinguishes errors, warnings, pending work, tested fields, and validity.
- Async tests automatically discard stale results when a newer run supersedes them.

Vest manages validation state. It does not own input values, DOM nodes, events, or form submission.

## Installation

```shell
npm i vest
```

## Current Vest 6 syntax

```js
import { create, enforce, test } from 'vest';

export const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });
});

const result = suite.run({ username: 'evyatar' });
result.isValid('username');
```

## Focused validation and retained state

Use suite-level focus at the call site for user-driven validation:

```js
const result = suite.only('username').run(formData);
```

Only username tests run. Previously established results for other fields remain in the suite.

For combined focus rules:

```js
suite
  .focus({
    only: ['street', 'city'],
    skipGroup: 'billing',
  })
  .run(formData);
```

Available modifiers are `only`, `skip`, `onlyGroup`, and `skipGroup`.

Use top-level `only()` and `skip()` inside the suite only when inclusion depends on business data rather than a UI event.

## Async validation

```js
const suite = create(data => {
  test('username', 'Username is already taken', async ({ signal }) => {
    const response = await fetch('/api/check-username', {
      method: 'POST',
      body: JSON.stringify({ username: data.username }),
      signal,
    });

    const { available } = await response.json();
    enforce(available).isTruthy();
  });
});
```

When username validation runs again, Vest cancels the previous test and ignores its eventual result. Pass the supplied `signal` to `fetch` to stop obsolete network work.

The result is usable immediately and is also awaitable:

```js
const result = suite.only('username').run(formData);

result.isPending('username');
result.hasErrors('username');

await result;
```

Await a full run before submission:

```js
const result = await suite.run(formData);

if (result.isValid()) {
  submit(formData);
}
```

Use `suite.afterEach(callback)` when the UI must update after the synchronous pass and after each async completion. Read the current result with `suite.get()` inside the callback.

## Dependent fields

Use `include` to run a related field when another focused field runs:

```js
import { create, enforce, include, test } from 'vest';

const suite = create(data => {
  include('confirmPassword').when('password');

  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('confirmPassword', 'Passwords do not match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });
});
```

Now `suite.only('password').run(data)` also reevaluates `confirmPassword`.

## Groups and multi-step workflows

```js
import { create, enforce, group, test } from 'vest';

const suite = create(data => {
  group('profile', () => {
    test('name', 'Name is required', () => {
      enforce(data.name).isNotBlank();
    });
  });

  group('address', () => {
    test('city', 'City is required', () => {
      enforce(data.city).isNotBlank();
    });
  });
});

suite.focus({ onlyGroup: 'address' }).run(formData);
```

Query group results with `isValidByGroup`, `hasErrorsByGroup`, `hasWarningsByGroup`, `getErrorsByGroup`, and `getWarningsByGroup`.

## Conditional and optional sections

Use `skipWhen` to avoid executing tests that are still required for eventual validity:

```js
skipWhen(
  result => result.hasErrors('username'),
  () => {
    test('username', 'Username is already taken', async () => {
      await checkUsername(data.username);
    });
  },
);
```

Use `omitWhen` when a section is currently irrelevant and should not count against suite validity:

```js
omitWhen(!data.hasShippingAddress, () => {
  test('street', 'Street is required', () => {
    enforce(data.street).isNotBlank();
  });
});
```

Use `optional(field)` for a field that may be empty but must pass its tests when provided.

## Errors, warnings, pending, and tested state

```js
result.isValid();
result.isValid('username');
result.hasErrors('username');
result.getError('username');
result.getErrors('username');
result.hasWarnings('password');
result.getWarning('password');
result.isPending('username');
result.isTested('username');
```

`isValid() === false` can mean the workflow is incomplete or pending; it does not always mean the user caused an error.

Create a non-blocking warning with `warn()`:

```js
import { enforce, test, warn } from 'vest';

test('password', 'Consider a stronger password', () => {
  warn();
  enforce(data.password).matches(/\d/);
});
```

For warnings invoked after an `await`, capture the warning callback with `useWarn()` before leaving the synchronous call stack.

## Dynamic lists

Use `each()` and give every test a stable key as the final argument:

```js
import { each, enforce, test } from 'vest';

each(data.travelers, traveler => {
  test(
    'travelerName',
    'Traveler name is required',
    () => enforce(traveler.name).isNotBlank(),
    traveler.id,
  );
});
```

Do not use an array index as the key when items can be inserted, removed, or reordered.

## Memoization and expensive checks

```js
import { memo } from 'vest/memo';

memo(
  () => {
    test('username', 'Username is already taken', async () => {
      await checkUsername(data.username);
    });
  },
  [data.username],
  { cacheSize: 5, ttl: 30_000 },
);
```

When dependencies match a cached run, Vest restores the earlier test result instead of repeating the work.

## Schema validation and parsing

```js
const accountSchema = enforce.shape({
  username: enforce.isString().trim(),
  age: enforce.isNumeric().toNumber(),
});

const suite = create(data => {
  test('age', 'Must be 18 or older', () => {
    enforce(data.age).greaterThanOrEquals(18);
  });
}, accountSchema);

const result = suite.run({ username: '  evyatar ', age: '30' });
result.value; // { username: 'evyatar', age: 30 } when valid
```

Schema-aware suites infer the run input, parsed callback data, result value, and field-oriented APIs.

Vest can also be used alongside Zod: use Vest for progressive interaction and Zod for a final submitted boundary.

## Server and SSR usage

Use stateless execution for independent server requests:

```js
const result = await suite.runStatic(requestBody);
```

Do not retain one user's state in another server request.

For SSR, serialize the server result and resume it in the browser:

```js
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

const state = SuiteSerializer.serialize(serverResult);
SuiteSerializer.resume(suite, state);
```

## Standard Schema

Vest suites and Enforce rules implement Standard Schema V1.

Pass the suite itself to a Standard Schema consumer. The consumer invokes the suite's `~standard.validate` contract automatically.

For application code, use `suite.run(data)` for stateful validation or `suite.runStatic(data)` for an independent server run. Do not treat `.validate()` as Vest's general execution API; it exists for Standard Schema interoperability.

If you are implementing or testing a Standard Schema integration directly, invoke the contract explicitly:

```js
const output = await suite['~standard'].validate(data);
```

## State lifecycle

```js
suite.get();
suite.reset();
suite.resetField('email');
suite.remove('removedDynamicField');
```

Reset a suite when beginning a new form transaction. Remove dynamic fields when they no longer exist so they do not affect overall validity.

## When not to use Vest

Vest may be unnecessary for a trivial synchronous form or a one-shot object parse. Use a schema validator when the primary task is defining and parsing a complete data boundary. Use a form manager when the primary task is input registration and value management.

## Obsolete patterns to avoid

Do not generate pre–Vest 6 APIs:

```js
suite(data); // obsolete: use suite.run(data)
result.done(callback); // obsolete: await the run or use suite.afterEach
promisify(suite); // obsolete: suite.run() is awaitable
staticSuite(...); // obsolete: use suite.runStatic(...)
test.memo(...); // obsolete: import memo from 'vest/memo'
```

Prefer `suite.only(field).run(data)` or `suite.focus(...).run(data)` for UI-driven focused validation.
