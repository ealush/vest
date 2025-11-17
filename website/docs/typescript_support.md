---
sidebar_position: 12
title: Typescript Support
description: Use Vest with the safety Typescript Provides you.
keywords: [Vest, Typescript, Typescript support]
---

# TypeScript Support

Vest is written fully in TypeScript, and as such, it provides extensive TypeScript support.

## Suite Generics

The Suite's `create` function takes three **optional** generic types - `FieldName`, `GroupName` and `Callback`.

| Name        | Type       | Optional? | Default    | Description                                                                                                                                                |
| ----------- | ---------- | --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FieldName` | `string`   | Yes       | `string`   | A union of the allowed field names in the suite. This type is propagated to all the suite and suite response methods.                                      |
| `GroupName` | `string`   | Yes       | `string`   | A union of the allowed group names in the suite. This type is propagated to all the suite and suite response methods.                                      |
| `Callback`  | `Function` | Yes       | `Function` | The type for the suite callback. This type is propagated into the suite callback, and can be used to defined the shape of the data for the suite callback. |

```typescript
import { create } from 'vest';

type FieldName = 'username' | 'password';
type GroupName = 'SignIn' | 'ChangePassword';
type Callback = (data: { username: string; password: string }) => void;

const suite = create<FieldName, GroupName, Callback>(data => {
  // data is now typed
  // ...
});

const res = suite.run();

res.getErrors('username');
res.getErrors('full_name'); // 🚨 Throws a compilation error
```

The following methods are typed:

- `getError`
- `getErrors`
- `getErrorsByGroup`
- `getWarning`
- `getWarnings`
- `getWarningsByGroup`
- `hasErrors`
- `hasErrorsByGroup`
- `hasWarnings`
- `hasWarningsByGroup`
- `isValid`
- `isValidByGroup`
- `suite.after`

## Typing Runtime Functions

The types mentioned above are useful, but they are not as strict, and only provides partial safety, as they only deal with the result object and not with the suite's operation.

The following functions can make use of the suite's types as well:

- `group`
- `include`
- `omitWhen`
- `only`
- `optional`
- `skip`
- `skipWhen`
- `test`

To do so, you can type your suite as mentioned in the previous section, and destruct these from directly from the suite.

```typescript
import { create } from 'vest';

type TData = { username: string; password: string };
type FieldName = keyof TData;
type GroupName = 'SignIn' | 'ChangePassword';
type Callback = (data: TData) => void;

const suite = create<FieldName, GroupName, Callback>(data => {
  only('username');

  test('username', 'Password is required', () => {
    /*...*/
  }); // ✅
  test('password', 'Password is too required', () => {
    /*...*/
  }); // ✅

  test('confirm', 'Passwords do not match', () => {
    /*...*/
  }); // 🚨 Will throw a compilation error
});

const { test, group, only } = suite;
```

## Schema-Aware Suite Creation

Vest can infer the type of your suite's data argument directly from an `n4s` schema. This provides automatic type safety for your suite callback and `.run()` method without manually defining types. Additionally, the schema is executed at runtime, and validation errors are automatically registered in the suite result.

To use this feature, pass your `n4s` schema as the second argument to `create`:

```ts
import { create, test, enforce } from 'vest';

const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // data is automatically typed as: { username: string; age: number }

  test('username', () => {
    enforce(data.username).isNotEmpty();
  });
}, userSchema);

// Type-safe execution
suite.run({ username: 'example', age: 30 }); // ✅ Valid
suite.run({ username: 'example' }); // ❌ Error: Property 'age' is missing
suite.run({ username: 123, age: 30 }); // ❌ Error: Type 'number' is not assignable to type 'string'
```

This also works with `enforce.loose()` and `enforce.partial()` schemas.

## Explicitly Typed Suite

Vest exports the following types so you can use them to annotate your functions and variables:

- `Suite<FieldName, GroupName, Callback>`<br/>
  A single suite instance.

- `SuiteRunResult<FieldName, GroupName>`<br/>
  The immediate output of a suite invocation - `suite.run()`, including the `after()` function.

- `SuiteResult<FieldName, GroupName>`<br/>
  Non-actionable suite result, meaning - the same as SuiteResult, but without the `after()` function. The return type of the result object from `suite.run()`.

- `SuiteSummary<FieldName, GroupName>`<br/>
  The static suite summary, all test results defined in the result object.

- `IsolateTest<FieldName, GroupName>`<br/>
  Rperesents a Vest test.

## Custom Enforce Rules

See [Custom Rule Typescript Support](./enforce/creating_custom_rules.md#custom-rule-typescript-support);
