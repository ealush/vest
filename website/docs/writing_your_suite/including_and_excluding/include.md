---
sidebar_position: 5
title: Linking fields together
description: Sometimes we want to run tests on multiple fields together. "include" is a way to do this.
keywords: [Vest, Include, Link, Linking fields together]
---

# Conditionally Running tests together - linked fields

There are scenarios in which we want to conditionally run tests on fields that are not the ones the user is currently interacting with. The most common case is when we have fields that depend on one another, and when changing one, the other should re-run its validation as well. For example, when we have two number fields, and we want to make sure that one is lower than the other. When the user interacts with one, we want to make sure the other one is revalidated.

This can be done with `include` and its `when` modifier.

When applied by itself, `include` behaves as an addition to only and not as a substitute for it. It takes a field name to include, if there are no other criteria (such as skip or skipWhen applied) that cause the field to be skipped, it will be run.

```js
include('fieldName');
```

`include` also has a `.when` modifier, that can add more specific criteria to when the field should be included. The when modifier can be passed one of the following:

| type       | description                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| `string`   | A name of a different field. When that field is included via `only()`, this field will be included as well. |
| `function` | A function that returns a boolean. When the function returns true, the field will be included.              |
| `boolean`  | A boolean. When true, the field will be included.                                                           |

```js
include('confirm').when('password'); // Will include "confirm" when we have `only('password')`
```

```js
include('confirm').when(someValue); // Will include "confirm" when `someValue` is `true`
```

```js
include('confirm').when(() => someValue); // Will include "confirm" when the callback returns true
```

:::tip Note
All these will only applied if the field is not skipped directly, or excluded because it is in a skipped group.
:::

When using the function modifier, the function is evaluated each time a matching field is observed, so if we have multiple tests with the same name, the callback will be checked each time.

The function modifier gets as its argument the current suite result object, so we can include fields based on the current result.

```js
include('username').when(result => result.hasErrors('username'));
```

## Usage Examples

```js
create((data = {}, currentField) => {
  only(currentField); // 'password'

  include('confirm').when('password'); // 'confirm' will also run if `currentField` is 'password'

  test('password', 'password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('confirm', 'Passwords do not match', () => {
    enforce(data.confirm).equals(data.password);
  });
});
```

In the example above you'll see that we're running the validation for `confirm` both when `currentField` is `password` and when it is `confirm`. This is useful, but you'll quickly see that it has its limitations. For example, what if the user did not fill in the `confirm` field? We'll get an error, even though we should probably wait for the confirm field to be filled in.

This is why we also support the more verbose functional `when` condition that allows you to specify a function that returns a boolean, and gives you more control over when the field is included.

```js
create((data = {}, currentField) => {
  only(currentField); // 'password'

  include('confirm').when(() => currentField === 'password' && data.confirm);
  // 'confirm' will also run when `currentField` is 'password' and `data.confirm` is not empty

  test('password', 'password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('confirm', 'Passwords do not match', () => {
    enforce(data.confirm).equals(data.password);
  });
});
```
