---
sidebar_position: 2
title: Accessing Vest's Result
description: Vest validations return a results object that holds all the information regarding the current run and methods to interact with the data.
keywords: [Vest, Results object, methods, selectors, hasErrors, isValid]
---

# Accessing Vest's Result

Vest validations return a results object that holds all the information regarding the current run and methods to interact with the data. You can access it in three ways:

- `const result = suite.run(data);` — runs the suite and returns the latest result (Promise-like when async).
- `const result = suite.get();` — returns the current result without running.
- `suite.hasErrors()`, `suite.isValid()`, etc. — selectors are also exposed directly on the suite.

```js
const result = suite.run(data);
```

:::note Async suites
When your suite contains async tests, the returned result is also a Promise. You can still read sync fields immediately, while pending async fields report `isPending('field') === true`.
:::

## Example result object

```javascript
{
  errorCount: 1,
  warnCount: 1,
  testCount: 4,
  pendingCount: 0,
  valid: false,
  errors: [{ fieldName: 'field1', message: 'msg1', groupName: undefined }],
  warnings: [{ fieldName: 'field3', message: undefined, groupName: undefined }],
  tests: {
    field1: {
      testCount: 2,
      errorCount: 1,
      pendingCount: 0,
      warnCount: 0,
      valid: false,
      errors: ['msg1'],
      warnings: [],
    },
    field2: {
      testCount: 1,
      errorCount: 0,
      pendingCount: 0,
      warnCount: 0,
      valid: true,
      errors: [],
      warnings: [],
    },
    field3: {
      testCount: 1,
      errorCount: 0,
      pendingCount: 0,
      warnCount: 1,
      valid: true,
      errors: [],
      warnings: [],
    },
  },
  types: undefined, // present when a schema is provided
}
```

## `isValid`

`isValid` returns whether the validation suite as a whole or a single field is valid or not.

### Suite validity

A _suite_ is considered valid if the following conditions are met:

- There are no errors (`hasErrors() === false`) in the suite - warnings are not counted as errors.
- All non [optional](./optional_fields.md) fields have passing tests.
- There are no pending async tests.

```js
suite.isValid();
suite.get().isValid();
result.isValid();
```

### Field validity

A _field_ is considered valid if the following conditions are met:

- The field has no errors (`hasErrors() === false`) or the field is omitted via the functional "optional" API.
- All non-optional tests for the field are passing.
- The field has no pending tests.

```js
suite.isValid('username');
suite.get().isValid('username');
result.isValid('username');
```

:::tip NOTE
When `isValid` equals `false` it does not necessarily mean that the form is inValid. It only means that might not be valid _yet_. For example, if not all the fields are filled, the form is not valid yet, even though it may not be strictly invalid.
:::

## `hasErrors` and `hasWarnings`

If you only need to know if a certain field has validation errors or warnings but don't really care which they are, you can use `hasErrors` or `hasWarnings` functions.

```js
result.hasErrors('username');
// true

result.hasWarnings('password');
// false
```

In case you want to know whether the whole suite has errors or warnings (to prevent submit, for example), you can use the same functions, just without specifying a field

```js
result.hasErrors();
// true

result.hasWarnings();
// true
```

## `isValidByGroup`

Similar to `isValid`, but returns the result for a specified [group](../writing_tests/advanced_test_features/grouping_tests.md). Providing a group name that doesn't exist will return `false`. When adding a fieldName, only the field within that group will be checked.

```js
result.isValidByGroup('groupName', 'fieldName');
result.isValidByGroup('groupName');
```

### Return Value

Returns a boolean value, whether the group/field combo is valid or not.

### Parameters

| Parameter | Type   | Required? | Description                                                                                              |
| --------- | ------ | --------- | -------------------------------------------------------------------------------------------------------- |
| groupName | string | Yes       | Name of the group                                                                                        |
| fieldName | string | No        | Name of the field. When specified, only the result for the specified field within the group is returned. |

## `hasErrorsByGroup` and `hasWarningsByGroup`

Similar to `hasErrors` and `hasWarnings`, but returns the result for a specified [group](../writing_tests/advanced_test_features/grouping_tests.md)

To get the result for a given field in the group:

```js
result.hasErrorsByGroup('groupName', 'fieldName');
// true

result.hasWarningsByGroup('groupName', 'fieldName');
// false
```

And to get the result for a whole group.

```js
result.hasErrorsByGroup('groupName');
// true

result.hasWarningsByGroup('groupName');
// true
```

[Read more about groups](../writing_tests/advanced_test_features/grouping_tests.md)

## `getError` and `getWarning`

:::warning WARNING
Both these functions may return undefined when no errors or warnings are present, so make sure to check for that if you're relying on their return value.
:::

### `getError()`

```typescript
// When no field name is provided: Gets the first error object
const firstError = result.getError();
console.log(firstError);
// Output: { fieldName: 'username', message: 'Username is required', groupName: undefined }

// When a fieldname is provided: Gets the first error message for the field
const usernameError = result.getError('username');
console.log(usernameError);
// Output: 'Username is required'
```

The `getError()` function allows you to retrieve the first error message of a given field. If a field name is not provided, it returns the first error object in the `errors` array.

If a field name is provided, it returns the first error message for that field, or `undefined` if there were no errors for that field. If no field name is provided, it returns the first error object in the `errors` array, or `undefined` if there were no errors.

#### Example

```js
const error = result.getError(); // get first error object
console.log(`Error on field ${error.fieldName}: ${error.message}`);
```

### `getWarning()`

```typescript
// When no field name is provided: Gets the first warning object in the suite
const firstWarning = result.getWarning();
console.log(
  `First warning: ${firstWarning.fieldName} - ${firstWarning.message}`,
);

// When a field name is provided: Gets the first warning string for the field
const usernameWarning = result.getWarning('username');
console.log(`Warning for username field: ${usernameWarning}`);
```

The `getWarning()` function allows you to retrieve the first warning message of a given field. If a field name is not provided, it returns the first warning object in the `warnings` array.

If a field name is provided, it returns the first warning message for that field, or `undefined` if there were no warnings for that field.

## `getMessage`

`getMessage` returns the first error or warning message for a given field. If a given field has both errors and warnings, it will return the first error message.

## `getErrors` and `getWarnings`

These functions return an array of errors for the specified field. If no field is specified, it returns an object with all fields as keys and their error arrays as values.

```js
result.getErrors('username');
// ['Username is too short', `Username already exists`]

result.getWarnings('password');
// ['Password must contain special characters']
```

If there are no errors for the field, the function defaults to an empty array:

```js
result.getErrors('username');
// []

result.getWarnings('username');
// []
```

You can also call these functions without a field name, which will return you an array per field:

```js
result.getErrors();

// {
//   username: ['Username is too short', `Username already exists`],
//   password: ['Password must contain special characters']
// }
```

:::tip NOTE
If you did not specify error messages for your tests, your errors array will be empty as well. In such case you should always rely on `.hasErrors()` instead.
:::

## `getErrorsByGroup` and `getWarningsByGroup`

Just like get `getErrors` and `getWarnings`, but narrows the result to a specified [group](../writing_tests/advanced_test_features/grouping_tests.md).

```js
result.getErrorsByGroup('groupName', 'fieldName');
result.getWarningsByGroup('groupName', 'fieldName');
result.getErrorsByGroup('groupName');
result.getWarningsByGroup('groupName');
```

[Read more about groups](../writing_tests/advanced_test_features/grouping_tests.md).

## `.afterEach()` and `await suite.run()`

[Read the full guide on Handling Suite Completion](./handling_completion.md).

Use `.afterEach()` to register a callback that will be called after the initial sync completion and again after each async test finishes. This is the recommended way to handle completion logic, including async suites. You can also use `await suite.run()` to get the result when all tests are finished.

| Parameter           | Type       | Required? | Description                                                                                                     |
| ------------------- | ---------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `callback`          | `Function` | Yes       | A callback to be run after each completion cycle. Use with `.afterEach(callback).run()` for completion logic.   |
| `await suite.run()` | `Promise`  | No        | Returns a promise that resolves when the suite is done running. Use with async/await for modern async handling. |

If you need to check for completion of specific fields, do so inside your callback logic.

`.afterEach()` can be chained before calling `.run()`, and multiple callbacks can be registered if needed.

Example:

```js
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test(
    'UserEmail',
    'Marked as spam address',
    async () => await isKnownSpammer(data.address),
  );

  test(
    'UserName',
    'must not be blacklisted',
    async () => await isBlacklistedUser(data.username),
  );
});

suite
  .afterEach(res => {
    if (res.hasErrors('UserName')) {
      showUserNameErrors(res.errors);
    }
    reportToServer(res);
    promptUserQuestionnaire(res);
  })
  .run();
```

:::danger IMPORTANT
Do not use `.afterEach()` conditionally, especially with async tests. This might cause unexpected behavior or missed callbacks. Instead, perform your conditional logic within your callback.
:::

```js
// 🚨 This might not work as expected when working with async validations

if (field === 'username') {
  suite
    .afterEach(result => {
      /*do something*/
    })
    .run();
}
```

```js
// ✅ Instead, perform your checks within your after callback

suite
  .afterEach(result => {
    if (field === 'username') {
      /*do something*/
    }
  })
  .run();
```

## `.afterField()`

Similar to `.afterEach()`, but runs when a specific field finishes validation.

```javascript
suite.afterField('username', res => {
  if (res.hasErrors('username')) {
    // handle username errors
  }
});
```

## isPending

Returns whether the suite, or a specific field are pending or not. A suite is considered pending if it has unresolved [async tests](../writing_tests/async_tests.md).

Returns `true` if the suite is pending, `false` otherwise.

```js
import { create, test } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is already taken', async () => {
    await someServerCall();
  });
});

// Hybrid result: sync selectors work immediately
const result = suite.run(); // Promise-like

if (result.isPending('username')) {
  // show spinner while async test runs
}

await result; // resolves when async tests finish
```

## isTested

Returns whether a given field has been tested or not. A field is considered tested if it has at least one test that ran. Often used as a replacement for dirty checking.

Returns `true` if the field is tested, `false` otherwise.

```js
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
});

const result = suite.run();
result.isTested('username'); // true if username has been tested
```
