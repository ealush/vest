---
sidebar_position: 2
title: Accessing Vest's Result
description: Vest validations return a results object that holds all the information regarding the current run and methods to interact with the data.
keywords:
  [
    Vest,
    Results object,
    methods,
    selectors,
    hasErrors,
    isValid,
    getErrors,
    hasWarnings,
    getWarnings,
    getError,
    getWarning,
  ]
---

# Accessing Vest's Result

Vest validations return a results object that holds all the information regarding the current run and methods to interact with the data.

A result object would look somewhat like this:

```js
{
  'valid': false,           // Whether the suite as a whole is valid or not
  'errorCount': 0,          // Overall count of errors in the suite
  'warnCount': 0,           // Overall count of warnings in the suite
  'testCount': 0,           // Overall test count for the suite (passing, failing and warning)
  'pendingCount': 0,        // Overall count of unresolved async tests in the suite
  'tests': {                // An object containing all non-skipped tests
    ['fieldName']: {        // Name of each field
      'errorCount': 0,      // Error count per field
      'errors': [],         // Array of error messages fer field (may be undefined)
      'warnings': [],       // Array of warning messages fer field (may be undefined)
      'warnCount': 0,       // Warning count per field
      'testCount': 0,       // Overall test count for the field (passing, failing and warning)
      'pendingCount': 0,    // Overall count of unresolved async tests in the current field
      'valid': false,       // Field specific validity
    },
    'groups': {             // An object containing groups declared in the suite
      ['fieldName']: {      // Subset of res.tests[fieldName]
        /*... */            // only containing tests that ran within the group
      }
    }
  }
  'errors': [               // An array containing all the errors occurred in order
    {
      fieldName: "fieldname",
      groupName: undefined, // or whatever group we're in
      message: "validation message"
    },
  ],
  'warnings': [{            // An array containing all the warnings occurred in order
      fieldName: "fieldname",
      groupName: undefined, // or whatever group we're in
      message: "validation message"
    }]
}
```

# Suite Result Methods

Along with this data, our result object also contains a few other methods that can be used to interact with the data. All these methods can be accessed in the following ways:

1. Directly via the result object returned by the suite.
2. Calling the method on the suite itself.
3. Via the `suite.get()` method.

All the following examples are valid and equivalent:

```js
const result = suite(formData);

// 1 - Directly via the result object
result.hasErrors();

// 2 - Calling the method on the suite itself
suite.hasErrors();

// 3 - Via the `suite.get()` method
suite.get().hasErrors();
```

## `isValid`

`isValid` returns whether the validation suite as a whole or a single field is valid or not.

### Suite validity

A _suite_ is considered valid if the following conditions are met:

- There are no errors (`hasErrors() === false`) in the suite - warnings are not counted as errors.
- All non [optional](./optional_fields.md) fields have passing tests.
- There are no pending async tests.

```js
result.isValid();

suite.isValid();

suite.get().isValid();
```

### Field validity

A _field_ is considered valid if the following conditions are met:

- The field has no errors (`hasErrors() === false`) or the field is omitted via the functional "optional" API.
- All non-optional tests for the field are passing.
- The field has no pending tests.

```js
result.isValid('username');

suite.isValid('username');

suite.get().isValid('username');
```

:::tip NOTE
When `isValid` equals `false` it does not necessarily mean that the form is inValid. It only means that might not be valid _yet_. For example, if not all the fields are filled, the form is not valid yet, even though it may not be strictly invalid.
:::

## `hasErrors` and `hasWarnings`

If you only need to know if a certain field has validation errors or warnings but don't really care which they are, you can use `hasErrors` or `hasWarnings` functions.

```js
resultObject.hasErrors('username');
// true

resultObject.hasWarnings('password');
// false
```

In case you want to know whether the whole suite has errors or warnings (to prevent submit, for example), you can use the same functions, just without specifying a field

```js
resultObject.hasErrors();
// true

resultObject.hasWarnings();
// true
```

## `isValidByGroup`

Similar to `isValid`, but returns the result for a specified [group](../writing_tests/advanced_test_features/grouping_tests.md). Providing a group name that doesn't exist will return `false`. When adding a fieldName, only the field within that group will be checked.

```js
resultObject.isValidByGroup('groupName', 'fieldName');
resultObject.isValidByGroup('groupName');
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
resultObject.hasErrorsByGroup('groupName', 'fieldName');
// true

resultObject.hasWarningsByGroup('groupName', 'fieldName');
// false
```

And to get the result for a whole group.

```js
resultObject.hasErrorsByGroup('groupName');
// true

resultObject.hasWarningsByGroup('groupName');
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
  `First warning: ${firstWarning.fieldName} - ${firstWarning.message}`
);

// When a field name is provided: Gets the first warning string for the field
const usernameWarning = result.getWarning('username');
console.log(`Warning for username field: ${usernameWarning}`);
```

The `getWarning()` function allows you to retrieve the first warning message of a given field. If a field name is not provided, it returns the first warning object in the `warnings` array.

If a field name is provided, it returns the first warning message for that field, or `undefined` if there were no warnings for that field. If no

## `getErrors` and `getWarnings`

These functions return an array of errors for the specified field. If no field is specified, it returns an object with all fields as keys and their error arrays as values.

```js
resultObject.getErrors('username');
// ['Username is too short', `Username already exists`]

resultObject.getWarnings('password');
// ['Password must contain special characters']
```

If there are no errors for the field, the function defaults to an empty array:

```js
resultObject.getErrors('username');
// []

resultObject.getWarnings('username');
// []
```

You can also call these functions without a field name, which will return you an array per field:

```js
resultObject.getErrors();

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
resultObject.getErrorsByGroup('groupName', 'fieldName');
resultObject.getWarningsByGroup('groupName', 'fieldName');
resultObject.getErrorsByGroup('groupName');
resultObject.getWarningsByGroup('groupName');
```

[Read more about groups](../writing_tests/advanced_test_features/grouping_tests.md).

## `.done()`

Done is a function that can be chained to your validation suite, and allows invoking callbacks whenever one, or all fields, are finished running - regardless of the validation result.

If we specify a field name in our `done` call, Vest will not wait for the whole suite to finish before running our callback. It will invoke immediately when all tests with that given name finish running.

`.done()` calls can be infinitely chained after one another, and as the validation suite completes - they will all run immediately.

`done` takes one or two arguments:

| Name        | Type       | Optional | Description                                                                                                                     |
| ----------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `fieldName` | `String`   | Yes      | If passed, the current done call will not wait for the whole suite to complete, but instead wait for a certain field to finish. |
| `callback`  | `Function` | No       | A callback to be run when either the whole suite or the specified field finished running.                                       |

The result object is being passed down to the `done` object as an argument.

In the below example, the `done` callback for `UserName` may run before the whole suite finishes. Only when the rest of the suite finishes, it will call the other two done callbacks that do not have a field name specified.

```js
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test(
    'UserEmail',
    'Marked as spam address',
    async () => await isKnownSpammer(data.address)
  );

  test(
    'UserName',
    'must not be blacklisted',
    async () => await isBlacklistedUser(data.username)
  );
});

const validationResult = suite(data)
  .done('UserName', res => {
    if (res.hasErrors('UserName')) {
      showUserNameErrors(res.errors);
    }
  })
  .done(output => {
    reportToServer(output);
  })
  .done(output => {
    promptUserQuestionnaire(output);
  });
```

:::danger IMPORTANT
.done calls must not be used conditionally - especially when involving async tests. This might cause unexpected behavior or missed callbacks. Instead, if needed, perform your conditional logic within your callback.
:::

```js
// 🚨 This might not work as expected when working with async validations

if (field === 'username') {
  result.done(() => {
    /*do something*/
  });
}
```

```js
// ✅ Instead, perform your checks within your done callback

result.done(() => {
  if (field === 'username') {
    /*do something*/
  }
});
```

## isPending

Returns whether the suite, or a specific field are pending or not. A suite is considered pending if it has unresolved [async tests](../writing_tests/async_tests.md).

Returns `true` if the suite is pending, `false` otherwise.

```js
const suite = vest.create(() => {
  test('username', 'Username is already taken', async () => {
    await someServerCall();
  });
});

result.isPending();

suite.isPending();

suite.get().isPending();

result.isPending('username');

suite.isPending('username');

suite.get().isPending('username');
```

## isTested

Returns whether a given field has been tested or not. A field is considered tested if it has at least one test that ran.

Returns `true` if the field is tested, `false` otherwise.

```js
const suite = vest.create(() => {
  test("username", "Username is required", () => {
    enforce(username).isNotBlank();
  });
});

suite.isTested("username"); // true if username has been tested
```
