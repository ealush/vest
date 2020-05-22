# Vest's result object

Vest validations reuturn a results object that holds all the information regarding the current run, and methods to easily interact with the data.

A result object would look somewhat like this:

```js
{
  'name': 'formName',       // The name of the validation suite
  'errorCount': 0,          // Overall count of errors in the suite
  'warnCount': 0,           // Overall count of warnings in the suite
  'tests': Object {         // An object containing all non-skipped tests
    'fieldName': Object {   // Name of each field
      'errorCount': 0,      // Error count per field
      'errors': Array [],   // Array of error messages fer field (may be undefined)
      'warnings': Array [], // Array of warning messages fer field (may be undefined)
      'warnCount': 0,       // Warning count per field
    },
  }
}
```

Along with these values, the result object exposes the following methods:

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

**Note** If you did not specify error messages for your tests, your errors array will be empty as well. In such case you should always rely on `.hasErrors()` instead.

## `.done()`

Done is a function that can be chained to your validation suite, and allows invoking callbacks whenever a specific, or all, tests finish their validation - regardless of the validation result.

If we specify a fieldname in our `done` call, vest will not wait for the whole suite to finish before running our callback. It will invoke immediately when all tests with that given name finished running.

`.done()` calls can be infinitely chained after one another, and as the validation suite completes - they will all run immediately.

`done` takes one or two arguments:

| Name        | Type       | Optional | Description                                                                                                                 |
| ----------- | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `fieldName` | `String`   | Yes      | If passed, current done call will not wait for the whole suite to complete, but instead wait for a certain field to finish. |
| `callback`  | `Function` | No       | A callback to be run when either the whole suite or the specified field finished running.                                   |

The result object is being passed down to the `done` object as an argument.

**Example**

In the below example, the `done` callback for `UserName` may run before the whole suite finishes. Only when the rest of the suite finishes, it will call the other two done callbacks that do not have a fieldname specified.

```js
import vest, { test, enforce } from 'vest';

const validate = vest.create('SendEmailForm', () => {
  test(
    'UserEmail',
    'Marked as spam address',
    async () => await isKnownSpammer(address)
  );

  test(
    'UserName',
    'must not be blacklisted',
    async () => await isBlacklistedUser(username)
  );
});

validate()
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
