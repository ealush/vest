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
    test.memo,
    warn,
    enforce,
    enforce.extend,
    compose,
    only,
    only.group,
    skip,
    include,
    include.when,
    skip.group,
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
    isValid,
    isValidByGroup,
    done,
    classnames,
    promisify,
    compose,
    staticSuite,
  ]
---

# API Reference

Below is a list of all the API functions exposed by Vest.

## Vest's main export API

- [create](./writing_your_suite/vests_suite.md#basic-suite-structure) - Creates a new Vest suite. Returns a function that runs your validations.

  - [suite.get](./writing_your_suite/vests_suite.md#using-suiteget) - Returns the current validation state of the suite.
  - [suite.remove](./writing_your_suite/vests_suite.md#removing-a-single-field-from-the-suite-state) - Removes a single field from the suite.
  - [suite.reset](./writing_your_suite/vests_suite.md#cleaning-up-our-validation-state) - Resets the suite to its initial state.
  - [suite.resetField](./writing_your_suite/vests_suite.md#cleaning-up-our-validation-state) - Resets a single field to an untested state.

- [staticSuite](./server_side_validations.md) - creates a stateless suite that is used for server side validations.

- [test](./writing_tests/the_test_function.md) - A single validation test inside your suite.

  - [test.memo](./writing_tests/advanced_test_features/test.memo.md) - Memoizes a test run as long as its dependencies haven't changed.
  - [warn](./writing_tests/warn_only_tests.md) - resides within the test body. Sets the test's severity to warning.

- [enforce](./enforce/enforce.md) - Asserts that a value matches your desired result.

  - [enforce.extend](./enforce/creating_custom_rules.md) - Extends the enforce API with your own custom assertions.
  - [compose](./enforce/composing_enforce_rules.md) - Compose multiple enforcers into a single enforcer.

- [only](./writing_your_suite/including_and_excluding/skip_and_only.md#only-running-specific-tests-including) - Makes Vest only run the provided field names.
- [skip](./writing_your_suite/including_and_excluding/skip_and_only.md#skipping-tests) - Makes Vest skip the provided field names.
- [include()/include.when()](./writing_your_suite/including_and_excluding/include) - Link fields by running them together based on a criteria.

- [skipWhen](./writing_your_suite/including_and_excluding/skipWhen.md) - Skips a portion of the suite when the provided condition is met.
- [omitWhen](./writing_your_suite/including_and_excluding/omitWhen.md) - Omits a portion of the suite when the provided condition is met.
- [optional](./writing_your_suite/optional_fields.md) - Allows you to mark a field as optional.
- [group](./writing_tests/advanced_test_features/grouping_tests.md) - Allows grouping multiple tests with a given name.
- [each](./writing_tests/advanced_test_features/dynamic_tests.md) - Allows iteration over an array of values to dynamically run tests.
- [mode](./writing_your_suite/execution_modes.md) - Determines whether Vest should continue running tests after a field has failed, or if it should bail immediately.
  - Possible modes are: 'EAGER' (default) and 'ALL'.

## Suite Result API

After running your suite, the results object is returned. It has the following functions:

- [hasErrors](./writing_your_suite/accessing_the_result.md#haserrors-and-haswarnings) - Returns true if the suite or the provided field has errors.
- [hasWarnings](./writing_your_suite/accessing_the_result.md#haserrors-and-haswarnings) - Returns true if the suite or the provided field has warnings.
- [getError](./writing_your_suite/accessing_the_result.md#geterror-and-getwarning) - Returns the first error in the suite, or of a specific field.
- [getWarning](./writing_your_suite/accessing_the_result.md#geterror-and-getwarning) - Returns the first warning in the suite, or of a specific field.
- [getErrors](./writing_your_suite/accessing_the_result.md#geterrors-and-getwarnings) - Returns an object with errors in the suite, or an array of objects for a specific field.
- [getWarnings](./writing_your_suite/accessing_the_result.md#geterrors-and-getwarnings) - Returns an object with warnings in the suite, or an array of objects for a specific field.
- [hasErrorsByGroup](./writing_your_suite/accessing_the_result.md#haserrorsbygroup-and-haswarningsbygroup) - Returns true if the provided group has errors.
- [hasWarningByGroup](./writing_your_suite/accessing_the_result.md#haserrorsbygroup-and-haswarningsbygroup) - Returns true if the provided group has warnings.
- [getErrorsByGroup](./writing_your_suite/accessing_the_result.md#geterrorsbygroup-and-getwarningsbygroup) - Returns an object with errors in the provided group.
- [getWarningsByGroup](./writing_your_suite/accessing_the_result.md#geterrorsbygroup-and-getwarningsbygroup) - Returns an object with warnings in the provided group.
- [isValid](./writing_your_suite/accessing_the_result.md#isvalid) - Returns true if the suite or the provided field is valid.
- [isValidByGroup](./writing_your_suite/accessing_the_result.md#isvalidbygroup) - Returns true if a certain group or a field in a group is valid or not.
- [done](./writing_your_suite/accessing_the_result.md#done) - Accepts a callback that will run when the suite is done running.

## Vest's external exports

- [vest/classnames](./utilities/classnames.md)
- [vest/promisify](./utilities/promisify.md)
- [vest/enforce/compose](./enforce/composing_enforce_rules.md)
