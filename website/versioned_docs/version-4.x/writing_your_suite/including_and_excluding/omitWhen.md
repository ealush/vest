---
sidebar_position: 4
title: conditionally omit tests from the suite
description: Sometimes we wish to conditionally omit tests from the suite so they are not considered when running the suite, and not just skip them. Use omitWhen for that.
keywords: [Vest, omitWhen, conditionally omit tests]
---

# omitWhen - Conditionally omit tests from a suite

In some cases, we need to wish to omit certain portions of our suite in a way that these tests won't run, and will not count against `isValid`. For example, when we have some tests that are only allowed to run when a certain checkbox is checked by the user.

Generally, when we skip fields, they are counted against `isValid`, meaning, unless specifically marked as `optional`, the suite will not be regarded as valid. Using `omitWhen` fixes it by both preventing the omitted tests from running, _and_ allowing the suite to be valid even without them.

## Differences from `skipWhen`

When using `skipWhen` the tests within the block will be skipped, but will still be counted against `isValid`. When using `omitWhen`, the tests within the block will be omitted, and will not be counted against `isValid`.

This also means that the validation message of a test, enclosed by `omitWhen`, is omitted from the suite result if the condition for the `omitWhen` is true. It is unlike the `skipWhen` modifier which caches the validation message of an enclosed test if the test was skipped.

## Params

| Name        | Type                   | Description                                                                                           |
| :---------- | :--------------------- | :---------------------------------------------------------------------------------------------------- |
| Conditional | `boolean`/`function`\* | The conditional expression to be evaluated. When Truthy, the tests within `omitWhen` will be omitted. |
| Body        | `function`             | A callback function containing the tests to either omit or run.                                       |

\* When using the function conditional, the function will be passed the current validation result as an argument, so it can be used to skip tests based on the current validation result.

## Usage Example

```js
import { create, test, enforce, omitWhen, only } from 'vest';

create((data = {}, currentField) => {
  only(currentField);

  test('username', 'username is required', () => {
    enforce(data.username).isNotBlank();
  });

  omitWhen(data.useNewAddress, () => {
    test('address_line_1', 'Address Line 1 is required', () => {
      enforce(data.address_line_1).isNotBlank();
    });

    test('city', 'City is required', () => {
      enforce(data.city).isNotBlank();
    });

    test('postal_code', 'Postal code is required', () => {
      enforce(data.postal_code).isNotBlank();
    });
  });
});
```

```js
omitWhen(
  res => res.hasErrors('username'),
  () => {
    test('username', 'Username already exists', () => {
      // this is an example for a server call
      return doesUserExist(data.username);
    });
  },
);
```
