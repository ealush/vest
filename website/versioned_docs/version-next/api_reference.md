---
sidebar_position: 4
title: Api reference
description: Reference to All Vest's exported functions
keywords:
  [
    Vest,
    API,
    Reference,
    create,
    suite.get,
    suite.remove,
    suite.reset,
    suite.resetField,
    test,
    warn,
    enforce,
    enforce.extend,
    compose,
    debounce,
    only,
    skip,
    include,
    include.when,
    skipWhen,
    omitWhen,
    optional,
    group,
    each,
    mode,
    hasErrors,
    hasWarnings,
    getErrors,
    getWarnings,
    hasErrorsByGroup,
    hasWarningByGroup,
    getErrorsByGroup,
    getWarningsByGroup,
    isPending,
    isTested,
    isValid,
    isValidByGroup,
    classnames,
    memo,
    SuiteSerializer,
    runStatic,
    validate,
    subscribe,
  ]
---

# API Reference

Below is a list of all the API functions exposed by Vest.

## Vest's main export API

### `create(callback, schema?)`

Creates a new validation suite. Returns a **Suite Object**.

- [Read more about `create`](./writing_your_suite/vests_suite.md)
- [Read more about Schema Validation](./writing_your_suite/schema_validation.md)

- `callback`: The validation logic.
- `schema` (Optional): An `enforce` schema definition.

### Suite Object Methods

#### `suite.run(...args)`

Runs the suite. Passes arguments to the suite callback.

- **Returns**: A `SuiteResult` object.
  - If the suite contains async tests, the result object **also implements the Promise interface**, allowing you to `await` it.
  - You can always access synchronous result data immediately (e.g., `result.hasErrors()`), even if the promise is pending.
- [Read more about `suite.run`](./writing_your_suite/vests_suite.md#running-validations)

#### `suite.runStatic(...args)`

Runs the suite in stateless mode. Useful for server-side validation.

- [Read more about Server Side Validation](./server_side_validations.md)

#### `suite.reset()`

Resets the suite state (clears all results).

- [Read more about `suite.reset`](./writing_your_suite/vests_suite.md#resetting-the-suite)

#### `suite.remove(fieldName)`

Removes a specific field from the suite result state.

- [Read more about `suite.remove`](./writing_your_suite/vests_suite.md#removing-a-field)

#### `suite.resetField(fieldName)`

Resets the state of a specific field (clears errors/warnings but keeps it in the result).

- [Read more about `suite.resetField`](./writing_your_suite/vests_suite.md#resetting-a-single-field)

#### `suite.focus(config)`

Prepares a focused run.

- `config`: `{ only?: string | string[], skip?: string | string[] }`
- [Read more about Focused Updates](./writing_your_suite/focused_updates.md)

#### `suite.afterEach(callback)`

Registers a callback to run after each test completes (including the initial sync run and every async completion).

- [Read more about `suite.afterEach`](./writing_your_suite/handling_completion.md#2-using-suiteaftereachcallback)

#### `suite.afterField(fieldName, callback)`

Registers a callback to run when a specific field finishes execution.

- [Read more about `suite.afterField`](./writing_your_suite/handling_completion.md#3-using-suiteafterfieldfieldname-callback)

#### `suite.get()`

Returns the current result object of the suite without running it. Useful for accessing the state inside UI components or subscribers.

- [Read more about `suite.get`](./writing_your_suite/vests_suite.md#accessing-results-without-running)

#### `SuiteSerializer.serialize(suite)`

Returns a minified, serialized representation of the suite's state. Useful for SSR hydration.

- [Read more about SSR Hydration](./server_side_validations.md#ssr--hydration)

#### `SuiteSerializer.resume(suite, data)`

Hydrates the suite with a serialized state.

- `suite`: The suite to resume.
- `data`: The serialized state object.
- [Read more about SSR Hydration](./server_side_validations.md#ssr--hydration)

#### `suite.validate(data)`

Runs the suite and returns a result compatible with the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

- [Read more about Standard Schema Support](./community_resources/standard_schema.md)

### Top-Level Exports

#### `enforce.context()`

Retrieves the current validation context during a suite run. Useful within custom rules to access other fields in the data object.

- **Returns**: `{ data: Object, value: any, ... }`
- [Read more about Context Aware Rules](./enforce/creating_custom_rules.md#context-aware-rules)

#### `enforce.extend(customRules)`

Extends Vest's enforce with custom validation rules.

- **Tip**: To add TypeScript support for your custom rules, see [TypeScript Support](./typescript_support.md#custom-enforce-rules).

#### `memo(callback, deps)`

Memoizes a block of tests.

- [Read more about `memo`](./writing_tests/advanced_test_features/memo.md)

#### `compose(...rules)`

Combines multiple enforce rules.

- [Read more about `compose`](./enforce/composing_enforce_rules.md)

#### `test(fieldName, message, callback)`

A single validation test inside your suite.

- [Read more about `test`](./writing_tests/the_test_function.md)

#### `enforce(value)`

Asserts that a value matches your desired result.

- [Read more about `enforce`](./enforce/enforce.md)

#### `warn()`

Sets the test's severity to warning.

- [Read more about `warn`](./writing_tests/warn_only_tests.md)

#### `only(fieldName)`

Makes Vest only run the provided field names.

- [Read more about `only`](./writing_your_suite/including_and_excluding/skip_and_only.md#only-running-specific-fields)

#### `skip(fieldName)`

Makes Vest skip the provided field names.

- [Read more about `skip`](./writing_your_suite/including_and_excluding/skip_and_only.md#skipping-fields)

#### `include(fieldName).when(condition)`

Link fields by running them together based on a criteria.

- [Read more about `include`](./writing_your_suite/including_and_excluding/include.md)

#### `skipWhen(condition, callback)`

Skips a portion of the suite when the provided condition is met.

- [Read more about `skipWhen`](./writing_your_suite/including_and_excluding/skipWhen.md)

#### `omitWhen(condition, callback)`

Omits a portion of the suite when the provided condition is met.

- [Read more about `omitWhen`](./writing_your_suite/including_and_excluding/omitWhen.md)

#### `optional(fieldName)`

Allows you to mark a field as optional.

- [Read more about `optional`](./writing_your_suite/optional_fields.md)

#### `group(groupName, callback)`

Allows grouping multiple tests with a given name.

- [Read more about `group`](./writing_tests/advanced_test_features/grouping_tests.md)

#### `each(list, callback)`

Allows iteration over an array of values to dynamically run tests.

- [Read more about `each`](./writing_tests/advanced_test_features/dynamic_tests.md)

#### `mode(mode)`

Determines whether Vest should continue running tests after a field has failed.

- [Read more about `mode`](./writing_your_suite/execution_modes.md)

## Suite Result API

After running your suite, the results object is returned. It has the following functions:

- [Read more about the Result Object](./writing_your_suite/accessing_the_result.md)

- `hasErrors(fieldName?)`: Returns true if the suite or the provided field has errors.
- `hasWarnings(fieldName?)`: Returns true if the suite or the provided field has warnings.
- `getErrors(fieldName?)`: Returns an object with errors in the suite, or an array of objects for a specific field.
- `getWarnings(fieldName?)`: Returns an object with warnings in the suite, or an array of objects for a specific field.
- `hasErrorsByGroup(groupName)`: Returns true if the provided group has errors.
- `hasWarningByGroup(groupName)`: Returns true if the provided group has warnings.
- `getErrorsByGroup(groupName)`: Returns an object with errors in the provided group.
- `getWarningsByGroup(groupName)`: Returns an object with warnings in the provided group.
- `isPending(fieldName?)`: Returns true if the suite has pending async tests.
- `isTested(fieldName)`: Returns true if the provided field has been tested.
- `isValid(fieldName?)`: Returns true if the suite or the provided field is valid.
- `isValidByGroup(groupName)`: Returns true if a certain group or a field in a group is valid or not.
