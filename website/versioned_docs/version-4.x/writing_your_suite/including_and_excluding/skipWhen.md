---
sidebar_position: 3
title: skipWhen for conditionally skipping tests
description: In some cases we might need to skip a test or a group based on a condition, skipWhen is a helper function for this.
keywords: [Vest, skipWhen, conditionally skip tests]
---

# skipWhen: Conditional Exclusion

In some cases we might need to skip a test or a group based on a condition, for example - based on the intermediate state of the currently running suite. To allow this, you can use `skipWhen`. `skipWhen` takes a boolean expression and a callback with tests.
If the expression is true, the tests within the callback will be skipped. Otherwise, the tests will run as normal.

:::tip Note
When using `skipWhen` the tests within the block will be skipped, but will still be counted against isValid, so as long as the tests don't run - the suite will not be marked as valid. If you wish these tests to override suite validity, use [`omitWhen`](./omitWhen) instead.
:::

## Params

| Name        | Type                   | Description                                                                                           |
| :---------- | :--------------------- | :---------------------------------------------------------------------------------------------------- |
| Conditional | `boolean`/`function`\* | The conditional expression to be evaluated. When Truthy, the tests within `skipWhen` will be skipped. |
| Body        | `function`             | A callback function containing the tests to either skip or run.                                       |

\* When using the function conditional, the function will be passed the current validation result as an argument, so it can be used to skip tests based on the current validation result.

## Usage Example

In the following example, we're skipping the server side verification of the username if the username is invalid to begin with:

```js
import { create, test, enforce, skipWhen } from 'vest';

export default create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  skipWhen(
    res => res.hasErrors('username'),
    () => {
      test('username', 'Username already exists', () => {
        // this is an example for a server call
        return doesUserExist(data.username);
      });
    },
  );
});
```
