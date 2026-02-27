# test API (`src/core/test/test.ts`)

## Purpose

`test.ts` defines Vest's primary `test(...)` API surface. It translates overloaded user input into a normalized test definition and creates a `Test` isolate.

## Responsibilities

- Support overloads for:
  - `test(field, cb)`
  - `test(field, message, cb)`
  - keyed variants for reconciliation determinism.
- Validate/normalize user arguments via `validateTestParams`.
- Emit `TEST_RUN_STARTED` to invalidate suite-result cache.
- Delegate actual execution to `IsolateTest` with `useAttemptRunTest` flow control.

## Collaborators

- `src/core/test/validateTestParams.ts`
- `src/core/test/testLevelFlowControl/runTest.ts`
- `src/core/isolate/IsolateTest/IsolateTest.ts`
- `src/core/VestBus/VestBus.ts`

## Nuances

- Cache invalidation event happens **before** isolate creation.
- Overload normalization is part of correctness: downstream isolate logic assumes a stable payload shape.
- Optional isolate keys are critical for stable reconciliation in dynamic list scenarios.
