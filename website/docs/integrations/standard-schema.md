---
title: Vest with Standard Schema
description: Tested runtime and type compatibility between Vest and Standard Schema.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

# Vest with Standard Schema

Standard Schema lets validation consumers invoke a Vest suite or an Enforce schema through a shared interface. This integration uses full-payload Standard Schema validation; it does not substitute for Vest's native focused, retained-state workflow APIs.

## Installation

```shell
npm install vest
```

The compatibility workspace pins @standard-schema/spec 1.0.0 and imports only public package entry points.

## Implementation example

This source is exercised by the runtime and compile-time checks in the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/standard-schema).

```ts
import { create, enforce, mode, Modes, test } from 'vest';

export const accountSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({
    age: enforce.isNumeric().toNumber(),
    name: enforce.isString().trim(),
  }),
});

export type AccountInput = Parameters<typeof accountSchema.parse>[0];
export type AccountOutput = ReturnType<typeof accountSchema.parse>;

export const accountSuite = create(data => {
  mode(Modes.ALL);
  test('profile.name', 'Name must contain at least 2 characters', () => {
    enforce(data.profile.name.trim()).longerThanOrEquals(2);
  });
  test('email', 'Email must contain an @ sign', () => {
    enforce(data.email.trim().toLowerCase()).matches(/@/);
  });
  test('email', 'Email must use the example.com domain', () => {
    enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
  });
}, accountSchema);

export const usernameSchema = enforce.shape({
  username: enforce.isString().trim(),
});

export type UsernameInput = Parameters<typeof usernameSchema.parse>[0];
export type UsernameOutput = ReturnType<typeof usernameSchema.parse>;

export function createUsernameSuite(
  isAvailable: (username: string) => Promise<boolean>,
) {
  return create(data => {
    test('username', 'Username is already taken', async () => {
      enforce(await isAvailable(data.username)).isTruthy();
    });
  }, usernameSchema);
}
```

## Tested versions

- Vest 6.3.2
- @standard-schema/spec 1.0.0

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

- Standard Schema runs complete validation and does not expose focused execution, retained state, warnings, groups, or race coordination.
- Enforce schemas identify their Standard Schema vendor as n4s; Vest suites identify their vendor as vest.

## Upstream status

Tracked in [standard-schema/standard-schema PR](https://github.com/standard-schema/standard-schema/pull/177).
