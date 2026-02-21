---
sidebar_position: 3
title: skipWhen for conditionally skipping tests
description: In some cases we might need to skip a test or a group based on a condition, skipWhen is a helper function for this.
keywords:
  [vest, skipwhen, conditional exclusion, skipping tests, conditional tests]
---

# skipWhen: Conditional Exclusion

Sometimes, you might need to skip a test or a group based on a condition. For instance, you might need to skip tests based on the intermediate state of the currently running suite. In such cases, you can use `skipWhen`, which is a helper function that takes a boolean expression and a callback with tests. If the expression evaluates to `true`, the tests within the callback will be skipped, and if it's `false`, the tests will run as normal.

## Parameters

The skipWhen function takes the following parameters:

| Name        | Type                   | Description                                                                                           |
| :---------- | :--------------------- | :---------------------------------------------------------------------------------------------------- |
| Conditional | `boolean`/`function`\* | The conditional expression to be evaluated. When Truthy, the tests within `skipWhen` will be skipped. |
| Body        | `function`             | A callback function containing the tests to either skip or run.                                       |

\* When using the function conditional, the function will be passed the current validation result as an argument so that it can be used to skip tests based on the current validation result.

:::tip Note
When using `skipWhen`, the tests within the block will be skipped, but will still be counted against `isValid`. As long as the tests don't run, the suite will not be marked as valid. If you wish these tests to override suite validity, use [`omitWhen`](./omitWhen) instead.
:::

## Usage Example

In the following example, we're skipping the server side verification of the username if the username is invalid to begin with:

```js
import { create, test, enforce, skipWhen } from 'vest';

export default create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  skipWhen(
    res => res.hasErrors('username'),
    () => {
      test('username', 'Username already exists', async () => {
        // this is an example for a server call
        return doesUserExist(data.username);
      });
    },
  );
});
```

In this example, we first validate that the `username` field is not empty. If it's empty, we report an error. Next, we use `skipWhen` to skip the verification of the username on the server-side if the `username` field has an error. If the `username` field does not have an error, we perform the server-side verification using a function called `doesUserExist`, which returns a promise that resolves to `true` if the username already exists, or `false` otherwise.

Using `skipWhen` allows us to conditionally skip tests, depending on the state of the validation result. In this case, it helps us avoid unnecessary server-side requests if the `username` field is empty, or if it already has an error.

:::caution IMPORTANT
The code within skipWhen will always run, regardless of whether the condition is met or not. `skipWhen` only affects the validation result, but if you call a function within `skipWhen`, it will run regardless of the condition.

```js
skipWhen(true, () => {
  console.log('This will always run');
});
```

:::
