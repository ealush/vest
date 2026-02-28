---
sidebar_position: 12
title: Typescript Support
description: Use Vest with the safety Typescript Provides you.
keywords: [Vest, Typescript, Typescript support]
---

# TypeScript Support

Vest is written fully in TypeScript and provides first-class typing for suites, schemas, and custom rules. There are four ways to create a typed suite, each offering a different level of control.

## Schema-Aware Suite Creation

Passing an `n4s` schema as the second argument to `create` automatically types your suite callback, `.run()` calls, and all suite-level APIs. The schema is enforced at runtime and the suite result records the validated `input` and `output` in `result.types`.

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

// Field names are inferred from schema keys
suite.remove('username'); // ✅
suite.resetField('age'); // ✅
suite.focus({ only: 'username' }); // ✅
suite.only('tags'); // ✅
suite.afterField('username', () => {}); // ✅

// suite.remove('email'); // ❌ compile-time error
// suite.focus({ only: 'email' }); // ❌ compile-time error

const result = suite.get();
result.hasErrors('username'); // ✅
// result.hasErrors('email'); // ❌ compile-time error
```

Works with `enforce.shape`, `enforce.loose`, and `enforce.partial`.

## Config Generic

Use `create<SuiteConfig>` when you want to declare field and group names explicitly without a schema. This gives you full type safety over all suite APIs.

```typescript
import { create, test, enforce } from 'vest';

const suite = create<{
  fields: 'username' | 'email' | 'password';
  groups: 'auth' | 'profile';
}>(data => {
  test('username', () => {}); // ✅
  test('email', () => {}); // ✅
  // test('phone', () => {}); // ❌ compile-time error
});

// All suite-level APIs are typed
suite.remove('username'); // ✅
suite.resetField('email'); // ✅
suite.focus({ only: 'password', onlyGroup: 'auth' }); // ✅
suite.only('username'); // ✅
suite.afterField('email', () => {}); // ✅

// suite.remove('phone'); // ❌ compile-time error
// suite.focus({ onlyGroup: 'billing' }); // ❌ compile-time error

const result = suite.get();
result.getErrors('username'); // ✅
// result.getErrors('phone'); // ❌ compile-time error
```

The `SuiteConfig` type is exported from Vest for reuse:

```typescript
import type { SuiteConfig } from 'vest';
```

## Escape Hatch

Use `create<null>()` when you need to opt out of field typing entirely. All APIs accept any string, which is useful for dynamic field generation or migration scenarios.

```typescript
import { create, test } from 'vest';

const suite = create<null>((data: any) => {
  test('dynamic_field', () => {});
});

// All APIs accept any string
suite.remove('anything');
suite.focus({ only: 'anything', onlyGroup: 'any_group' });
suite.only('anything');
suite.get().hasErrors('anything');
```

The escape hatch also works with a schema for runtime validation while keeping field names open:

```typescript
const suite = create<null>((data: any) => {
  test('anything', () => {});
}, schema);
```

## Untyped Fallback

When no generic is provided and no schema is passed, the suite accepts any string for field and group names. This is the default behavior and matches pre-typed Vest usage.

```typescript
import { create, test } from 'vest';

const suite = create((data: any) => {
  test('whatever', () => {});
});

suite.remove('whatever'); // any string accepted
suite.focus({ only: 'whatever' }); // any string accepted
```

## Typed Suite-Level APIs

When a suite is typed (via schema or config generic), the following APIs all enforce field and group names at compile time:

| API                                                 | Accepts               |
| --------------------------------------------------- | --------------------- |
| `suite.test(fieldName, ...)`                        | Field names           |
| `suite.only(field)`                                 | Field names           |
| `suite.skip(field)`                                 | Field names           |
| `suite.include(field)`                              | Field names           |
| `suite.optional(field)`                             | Field names           |
| `suite.group(groupName, cb)`                        | Group names           |
| `suite.remove(field)`                               | Field names           |
| `suite.resetField(field)`                           | Field names           |
| `suite.afterField(field, cb)`                       | Field names           |
| `suite.focus({ only, skip, onlyGroup, skipGroup })` | Field and group names |
| `result.hasErrors(field)`                           | Field names           |
| `result.getErrors(field)`                           | Field names           |
| `result.hasWarnings(field)`                         | Field names           |
| `result.getWarnings(field)`                         | Field names           |
| `result.isValid(field)`                             | Field names           |
| `result.isTested(field)`                            | Field names           |

You can also destructure typed helpers from the suite:

```typescript
const { test, group, only, skip, include, optional } = suite;
// These inherit the suite's field/group types
```

## Suite Result Types

Use exported types to annotate variables and APIs:

- `Suite<FieldName, GroupName, Callback>` - a suite instance.
- `SuiteResult<FieldName, GroupName>` - the result returned from `run`, `runStatic`, or `get`.
- `SuiteSummary<FieldName, GroupName>` - the static snapshot of all test results.

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
