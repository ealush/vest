---
title: Errors, Warnings, Pending, and Untested State
description: Show untested, pending, error, warning, and passing states correctly.
keywords: [validation errors, warnings, pending validation, untested fields]
---

# Errors, Warnings, Pending, and Untested State

Interactive validation has more than two states. A field may be untested, pending, passing, failing with a blocking error, or failing with a non-blocking warning.

| State    | What it means                                      | Typical UI                |
| -------- | -------------------------------------------------- | ------------------------- |
| Untested | The field has not been checked yet                 | Neutral guidance          |
| Pending  | Asynchronous work for the current value is running | Progress indicator        |
| Error    | A blocking rule failed                             | Error message             |
| Warning  | Advisory guidance failed                           | Non-blocking message      |
| Passing  | Current tested rules passed                        | Optional success feedback |

```ts
const result = suite.only('username').run(data);

const view = {
  tested: result.isTested('username'),
  pending: result.isPending('username'),
  errors: result.getErrors('username'),
  warnings: result.getWarnings('username'),
  valid: result.isValid('username'),
};
```

Do not render an error merely because `isValid(field)` is false. An untested or pending field can be incomplete without containing a user error.

Use warnings for guidance that should not block submission:

```ts
import { enforce, test, warn } from 'vest';

test('password', 'Add a number for a stronger password', () => {
  warn();
  enforce(data.password).matches(/\d/);
});
```

If warning severity depends on an asynchronous answer, capture `useWarn()` before the first `await` and call its setter while the test is still running:

```ts
import { enforce, test, useWarn } from 'vest';

test('username', 'This username is very common', async () => {
  const markAsWarning = useWarn();
  const common = await isCommonUsername(data.username);

  if (common) markAsWarning();
  enforce(common).isFalsy();
});
```

Calling `useWarn()` for the first time after an `await` has lost the active test context. Capture the setter synchronously when you need to decide the severity later.

Render status in this order:

1. Untested: neutral guidance.
2. Pending: progress feedback.
3. Error: blocking feedback.
4. Warning: advisory feedback.
5. Passing: success feedback when useful.

On submission, await the complete suite and require `isValid()`. Warnings do not make the suite invalid; errors, pending work, and incomplete required tests do.

Keep warnings separate from errors. That is what lets the UI show advice without blocking submission.

Read the [result selector reference](../writing_your_suite/accessing_the_result.md) and [warning guide](../writing_tests/warn_only_tests.md).
