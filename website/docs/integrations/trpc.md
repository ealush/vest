---
title: Vest with tRPC
description: Tested runtime and type compatibility between Vest and tRPC.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

# Vest with tRPC

tRPC accepts Standard Schema validators in its procedure input parser. This proof uses a real router and in-process caller, so invalid data is rejected before the procedure and Vest's parsed output reaches valid procedures.

## Installation

```shell
npm install vest @trpc/server
```

The compatibility workspace pins @trpc/server 11.18.0 and imports only public package entry points.

## Implementation example

This source is exercised by the runtime and compile-time checks in the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/trpc).

```ts
import { initTRPC, type inferRouterInputs } from '@trpc/server';
import { create, enforce, test } from 'vest';

const accountSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({ age: enforce.isNumeric().toNumber() }),
});

const usernameSchema = enforce.shape({
  username: enforce.isString().trim(),
});

export const accountSuite = create(data => {
  test('profile.age', 'Must be at least 18', () => {
    enforce(Number(data.profile.age)).greaterThanOrEquals(18);
  });
  test('email', 'Use an example.com email', () => {
    enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
  });
}, accountSchema);

const trpc = initTRPC.create();

export const appRouter = trpc.router({
  createAccount: trpc.procedure.input(accountSuite).mutation(({ input }) => ({
    account: input,
    accepted: true as const,
  })),
});

export type AppRouter = typeof appRouter;

export async function createAccount(
  input: inferRouterInputs<AppRouter>['createAccount'],
) {
  return appRouter.createCaller({}).createAccount(input);
}

export function createAsyncRouter(
  isAvailable: (username: string) => Promise<boolean>,
) {
  const usernameSuite = create(data => {
    test('username', 'Username is already taken', async () => {
      enforce(await isAvailable(data.username)).isTruthy();
    });
  }, usernameSchema);

  return trpc.router({
    reserveUsername: trpc.procedure
      .input(usernameSuite)
      .mutation(({ input }) => input),
  });
}
```

## Tested versions

- Vest 6.3.2
- @trpc/server 11.18.0

## Proven capabilities

- asynchronous
- input inference
- multiple issues
- nested paths
- output inference
- synchronous
- transformed output

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- Procedure input parsing validates complete payloads and does not expose Vest stateful interaction features.
- tRPC wraps Standard Schema failures in a BAD_REQUEST error.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.
