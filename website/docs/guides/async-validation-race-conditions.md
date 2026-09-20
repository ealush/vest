---
title: Async Validation Without Race Conditions
description: Prevent stale username, email, inventory, and eligibility responses from replacing current validation state.
keywords: [async form validation, race condition, AbortSignal, TypeScript, Vest]
---

# Async Validation Without Race Conditions

Async validation becomes incorrect when requests finish in a different order from the one in which they started. A slow response for an old value can otherwise replace the answer for the value currently on screen.

Vest associates async work with the run that created it. When a newer stateful
run supersedes an older one—focused or full—the older result cannot update the
current suite state. Awaiting the older run handle resolves to the newer run's
result, so callers cannot accidentally observe an obsolete result. Independent
`runStatic()` calls do not share this ownership chain.

```ts
import { create, enforce, skipWhen, test } from 'vest';

export const accountSuite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must contain at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  skipWhen(
    result => result.hasErrors('username'),
    () => {
      test('username', 'Username is already taken', async ({ signal }) => {
        const response = await fetch('/api/usernames/available', {
          body: JSON.stringify({ username: data.username }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          signal,
        });

        const { available } = await response.json();
        enforce(available).isTruthy();
      });
    },
  );
});
```

`skipWhen` keeps the remote rule relevant while avoiding the request until the inexpensive local username rules pass.

Run only the changed field:

```ts
const result = accountSuite
  .only('username')
  .afterEach(() => render(accountSuite.get()))
  .run(formData);

render(result); // synchronous and pending status is available immediately
await result; // resolves after the current async work completes
```

The `AbortSignal` stops obsolete network work when the transport supports cancellation. Vest's stale-result protection still guards the suite state even when the underlying request cannot be canceled.

## Submission

Focused runs are for interaction. Submission should run and await the complete suite:

```ts
const result = await accountSuite.run(formData);

if (result.isValid()) {
  await submit(formData);
}
```

Debouncing can reduce request volume, but it does not replace race handling. Networks can still reorder debounced requests.

## Common mistakes

| Mistake                                                   | Correction                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| Tracking request IDs only in the component                | Let Vest decide which test result still has authority       |
| Ignoring the test `signal`                                | Pass it to `fetch` or another abortable API                 |
| Awaiting before rendering local errors                    | Read the immediate result, then handle asynchronous updates |
| Using `hasErrors()` as a loading indicator                | Use `isPending(field)`                                      |
| Running the suite twice to register a completion callback | Chain `afterEach()` and `run()` on one focused suite call   |

## Verify the behavior

Test with deterministic delays: start three values, finish the newest first, and finish the oldest last. The final state must still describe the newest value.

See the interactive proof on the [Vest homepage](/) and the complete [async API reference](../writing_tests/async_tests.md).
