---
sidebar_position: 12
title: Typescript Support
description: Use Vest with the safety Typescript Provides you.
keywords: [Vest, Typescript, Typescript support]
---

# TypeScript Support

Vest is written fully in TypeScript, and as such, it provides extensive TypeScript support.

## Suite Generics

The Suite's `create` function takes three generic types - `Callback`, `FieldName`, `GroupName`.

- `Callback`: The type for the suite callback. This type is propagated into the suite callback, and can be used to defined the shape of the data for the suite callback.
- `FieldName`: A union of the allowed field names in the suite. This type is propagated to all the suite and suite response methods.
- `GroupName`: A union of the allowed group names in the suite. This type is propagated to all the suite and suite response methods.

```typescript
import { create } from 'vest';

type Callback = (data: {username: string, password: string}) => void;
type FieldName = "username" | "password";
type GroupName = "SignIn" | "ChangePassword;

const suite = create<Callback, FieldName, GroupName>((data) => { // data is now typed
  // ...
});

const res = suite();

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
- `res.done`
- `suite.get`

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

type TData = {username: string, password: string};
type Callback = (data: TData) => void;
type FieldName = keyof TData;
type GroupName = "SignIn" | "ChangePassword;

const suite = create<Callback, FieldName, GroupName>((data) => {
  only('username');

  test('username', 'Password is required' ,() => {/*...*/}); // ✅
  test('password', 'Password is too required' ,() => {/*...*/}); // ✅

  test('confirm', 'Passwords do not match' ,() => {/*...*/}); // 🚨 Will throw a compilation error
});

const { test, group, only } = suite;
```

## Custom Enforce Rules

See [Custom Rule Typescript Support](./enforce/creating_custom_rules.md#custom-rule-typescript-support);
