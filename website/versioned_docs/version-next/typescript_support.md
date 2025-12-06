---
sidebar_position: 12
title: Typescript Support
description: Use Vest with the safety Typescript Provides you.
keywords: [Vest, Typescript, Typescript support]
---

# TypeScript Support

Vest is written fully in TypeScript and provides first-class typing for suites, schemas, and custom rules.

## Schema-Aware Suite Creation

Passing an `n4s` schema as the second argument to `create` automatically types your suite callback and `.run()` calls. The schema is enforced at runtime and the suite result records the validated `input` and `output` in `result.types`.

```typescript
import { create, test, enforce } from 'vest';

const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
  tags: enforce.isArrayOf(enforce.isString()),
});

const suite = create(data => {
  // data is typed as: { username: string; age: number; tags: string[] }
  test('username', () => {
    enforce(data.username).isNotBlank();
  });
}, userSchema);

suite.run({ username: 'alice', age: 30, tags: [] }); // ✅
// suite.run({ username: 'alice' }); // ❌ Property 'age' is missing
// suite.run({ username: 42, age: 30, tags: [] }); // ❌ Type mismatch
```

Works with `enforce.shape`, `enforce.loose`, and `enforce.partial`.

## Suite Generics

`create` also accepts generic parameters when you want explicit control over field names, group names, or the callback signature.

```typescript
import { create } from 'vest';

type FieldName = 'username' | 'password';
type GroupName = 'SignIn' | 'ChangePassword';
type Callback = (data: { username: string; password: string }) => void;

const suite = create<FieldName, GroupName, Callback>(data => {
  // data is typed
});

const result = suite.run();
result.getErrors('username'); // typed
// result.getErrors('full_name'); // 🚨 compile-time error
```

The typed selectors include `getError`, `getErrors`, `getWarnings`, `hasErrors`, `hasWarnings`, `isValid`, `isValidByGroup`, and `suite.afterEach`.

## Typing Runtime Functions

When you destructure helpers from the suite, they inherit the suite's types. This keeps runtime calls like `test`, `only`, and `group` aligned with your field and group unions.

```typescript
import { create } from 'vest';

type Data = { username: string; password: string };
type FieldName = keyof Data;
type GroupName = 'SignIn' | 'ChangePassword';

const suite = create<FieldName, GroupName, (data: Data) => void>(data => {
  only('username');
  test('username', 'Username required', () => {});
});

const { test, group, only } = suite; // typed helpers
```

## Suite Result Types

Use exported types to annotate variables and APIs:

- `Suite<FieldName, GroupName, Callback>` — a suite instance.
- `SuiteResult<FieldName, GroupName>` — the result returned from `run`, `runStatic`, or `get`.
- `SuiteSummary<FieldName, GroupName>` — the static snapshot of all test results.
- `IsolateTest<FieldName, GroupName>` — represents a Vest test.

`SuiteResult` also carries `types.input` and `types.output` when a schema is present.

## Custom Enforce Rules

Extend `enforce` with value-first signatures so TypeScript can map them into both eager and lazy APIs.

```typescript
import { enforce } from 'vest';

const customRules = {
  isValidEmail: (value: string) => value.includes('@'),
  isWithinRange: (value: number, min: number, max: number) =>
    value >= min && value <= max,
};

enforce.extend(customRules);

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isValidEmail: (value: string) => boolean;
      isWithinRange: (value: number, min: number, max: number) => boolean;
    }
  }
}

enforce('test@example.com').isValidEmail();
enforce(10).isWithinRange(5, 15);
```

[Read more about custom rule typing](./enforce/creating_custom_rules.md#typescript-support).
