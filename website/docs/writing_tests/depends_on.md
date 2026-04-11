---
sidebar_position: 5
title: Cross-field Validation with dependsOn
---

# Cross-field Validation with `dependsOn`

Use `test(...).dependsOn(...)` to declare field dependencies for focused runs.

```ts
import { create, test, enforce } from 'vest';

const suite = create((data: { password: string; confirmPassword: string }) => {
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('confirmPassword', 'Passwords must match', () => {
    enforce(data.confirmPassword).equals(data.password);
  }).dependsOn('password');
});
```

## What it does

`dependsOn` is syntactic sugar over `include(field).when(depField)`.

```ts
// Equivalent wiring:
include('confirmPassword').when('password');
```

## The 3 Pillars

1. **Focus Sync**: when a dependency is focused with `suite.only(...)`, the dependent test is included too.
2. **Dirty-Field Guard**: the dependent test is included only after it has been tested at least once, so untouched fields do not light up too early.
3. **Validity Link**: if any dependency is invalid, the dependent field is considered invalid.

## Multiple dependencies

```ts
test('total', 'Total must be 100', () => {
  enforce(Number(data.a) + Number(data.b) + Number(data.c)).equals(100);
}).dependsOn('a', 'b', 'c');
```

## Rules and edge cases

- Self-dependency is not allowed (`test('x', ...).dependsOn('x')`) and throws.
- `dependsOn` can be combined with manual `include(...).when(...)` rules.
- It works in grouped tests and async tests as well.

## Typed suites

When using typed methods from a typed suite, `dependsOn` is typed to your suite fields.

```ts
const suite = create<'USERNAME' | 'PASSWORD'>(() => {
  const { test } = suite;

  test('PASSWORD', 'Required', () => false).dependsOn('USERNAME');
  // test('PASSWORD', 'Required', () => false).dependsOn('EMAIL'); // TS error
});
```
