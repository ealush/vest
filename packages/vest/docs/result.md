# Vest's result object

Vest validations return a results object that holds all the information regarding the current run, and methods to easily interact with the data.

A result object would look somewhat like this:

```js
{
  'errorCount': Number 0,          // Overall count of errors in the suite
  'warnCount': Number 0,           // Overall count of warnings in the suite
  'testCount': Number 0,           // Overall test count for the suite (passing, failing and warning)
  'tests': Object {                // An object containing all non-skipped tests
    'fieldName': Object {          // Name of each field
      'errorCount': Number 0,      // Error count per field
      'errors': Array [],          // Array of error messages fer field (may be undefined)
      'warnings': Array [],        // Array of warning messages fer field (may be undefined)
      'warnCount': Number 0,       // Warning count per field
      'testCount': Number 0,       // Overall test count for the field (passing, failing and warning)
    },
    'groups': Object {             // An object containing groups declared in the suite
      'fieldName': Object {        // Subset of res.tests[fieldName] only containing tests
        /*... */                   // only containing tests that ran within the group
      }
    }
  }
}
```

## Accessing the recent result object with `.get`

If you need to access your validation results out of context - for example, from a different UI component or function, you can use `.get()` - a function that exists as a property of your validation suite.

In case your validations did not run yet, `.get` returns an empty validation result object - which can be helpful when trying to access validation result object when rendering the initial UI, or setting it in the initial state of your components.

```js
const suite = create(() => {
  /*...*/
});

suite.get(); // -> returns the most recent result object for the current suite
```

# Result Object Methods:

Along with these values, the result object exposes the following methods:

## `isValid` function

`isValid` returns whether the validation suite as a whole or a single field is valid or not.

A _suite_ is considered valid if the following conditions are met:

- There are no errors (`hasErrors() === false`) in the suite - warnings are not counted as errors.
- All non [optional](./optional) fields have passing tests.
- There are no pending async tests.

```js
result.isValid();

suite.get().isValid();
```

A _field_ is considered valid if the following conditions are met:

- The field has no errors (`hasErrors() === false`) or the field is omitted via the functional "optional" API.
- All non optional tests for the field are passing.
- The field has no pending tests.

```js
result.isValid('username');

suite.get().isValid('username');
```

?> **Note** when `isValid` equals `false`, it does not necessarily mean that the form is inValid, but that it might not be valid _yet_. For example, if not all the fields are filled, the form is simply not valid, even though it may not be strictly invalid.

## `hasErrors` and `hasWarnings` functions

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

## `hasErrorsByGroup` and `hasWarningsByGroup` functions

Similar to `hasErrors` and `hasWarnings`, but returns the result for a specified [group](./group)

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

[Read more about groups](./group)

## `getErrors` and `getWarnings` functions

These functions return an array of errors for the specified field. If no field specified, it returns an object with all fields as keys and their error arrays as values.

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

!> **NOTE** If you did not specify error messages for your tests, your errors array will be empty as well. In such case you should always rely on `.hasErrors()` instead.

## `getErrorsByGroup` and `getWarningsByGroup` functions

Just like get `getErrors` and `getWarnings`, but narrows the result to a specified [group](./group).

```js
resultObject.getErrorsByGroup('groupName', 'fieldName');
resultObject.getWarningsByGroup('groupName', 'fieldName');
resultObject.getErrorsByGroup('groupName'');
resultObject.getWarningsByGroup('groupName'');
```

[Read more about groups](./group).

## `.done()`

Done is a function that can be chained to your validation suite, and allows invoking callbacks whenever a specific, or all, tests finish their validation - regardless of the validation result.

If we specify a field name in our `done` call, vest will not wait for the whole suite to finish before running our callback. It will invoke immediately when all tests with that given name finished running.

`.done()` calls can be infinitely chained after one another, and as the validation suite completes - they will all run immediately.

`done` takes one or two arguments:

| Name        | Type       | Optional | Description                                                                                                                     |
| ----------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `fieldName` | `String`   | Yes      | If passed, the current done call will not wait for the whole suite to complete, but instead wait for a certain field to finish. |
| `callback`  | `Function` | No       | A callback to be run when either the whole suite or the specified field finished running.                                       |

The result object is being passed down to the `done` object as an argument.

**Example**

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

!> **IMPORTANT** .done calls must not be used conditionally - especially when involving async tests. This might cause unexpected behavior or missed callbacks. Instead, if needed, perform your conditional logic within your callback.

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

### Read more on:

[Optional tests](./optional)
