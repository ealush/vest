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
    changed,
    dependsOn,
    describe,
    resolveAffected,
    suite.get,
    suite.remove,
    suite.reset,
    suite.resetField,
    test,
    warn,
    useWarn,
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
    getError,
    getWarning,
    getMessage,
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
  - If another `suite.run()` of the same suite starts while an earlier run is pending, awaiting the earlier result resolves with the newer run's result instead of waiting on work the newer run replaced. `runStatic()` runs are independent of each other.
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

Prepares a focused run with combined modifiers. Use this when you need to combine `only`, `skip`, `skipGroup`, or `onlyGroup` in a single call.

- `config`: `{ only?: string | string[], skip?: string | string[], skipGroup?: string | string[], onlyGroup?: string | string[] }`
- [Read more about Focused Updates](./writing_your_suite/focused_updates.md)

#### `suite.only(fieldName)`

Shorthand for `suite.focus({ only: fieldName })`. Restricts the next run to the specified field(s).

- `fieldName`: `string | string[]`
- Returns a chainable suite with `run`, `afterEach`, `afterField`, `focus`, and `only`.
- [Read more about Focused Updates](./writing_your_suite/focused_updates.md#running-only-specific-fields)

#### `suite.changed(fields)`

After `import 'vest/relationships'`, prepares a focused run for the named fields and their direct schema dependents. Call `.run(data)` on the returned suite.

- `fields`: `string | readonly string[]`; `changed([])` selects no fields itself, while `changed(undefined)` clears this focus. The suite callback and explicit inclusion hooks keep their ordinary behavior.
- `only()` adds explicit fields and `skip` excludes fields and their descendants from the affected set. Numeric bracket paths are normalized for skip comparisons.
- Schema validation checks affected top-level fields; nested member selection does not yet narrow schema execution.
- Use canonical dotted data paths for dependent test names. Explicitly named fields run unless skipped, even when they are not schema fields. Dependencies on a container also respond to changes in its descendants.
- Schema failures outside the affected names are reported without running those fields' user tests.
- A successful changed result's `value` contains only the validated fields and is typed as a partial schema output. Observing the current state through `suite.get()` also gives a partial output type. Its `valid` does not cover unchecked fields, so run the full suite before submitting. Await the result when tests are async.
- Without the opt-in import, the first changed run throws a setup error.
- [Read the relationships guide](./guides/schema-relationships.md).

#### `suite.afterEach(callback)`

Registers a callback to run after each test completes (including the initial sync run and every async completion). The callback receives **no arguments**; you should access the result using `suite.get()`.

- [Read more about `suite.afterEach`](./writing_your_suite/handling_completion.md#2-using-suiteaftereachcallback)

#### `suite.afterField(fieldName, callback)`

Registers a callback to run when a specific field finishes execution. The callback receives **no arguments**; you should access the result using `suite.get()`.

- [Read more about `suite.afterField`](./writing_your_suite/handling_completion.md#3-using-suiteafterfieldfieldname-callback)

#### `suite.get()`

Returns the current result object of the suite without running it. Useful for accessing the state inside UI components or subscribers.

- [Read more about `suite.get`](./writing_your_suite/vests_suite.md#accessing-results-without-running)

#### `SuiteSerializer.serialize(result)`

Returns a minified, serialized representation of a validation result. Useful for SSR hydration.

- [Read more about SSR Hydration](./server_side_validations.md#ssr--hydration)

#### `SuiteSerializer.resume(suite, data)`

Hydrates the suite with a serialized state.

- `suite`: The suite to resume.
- `data`: The serialized state string.
- [Read more about SSR Hydration](./server_side_validations.md#ssr--hydration)

#### `suite['~standard'].validate(data)`

Implements the [Standard Schema](https://standardschema.dev/) interoperability contract. Compatible consumers invoke this hook automatically. For application code, use the primary `suite.run(data)` stateful API or `suite.runStatic(data)` stateless API.

- [Read more about Standard Schema Support](./community_resources/standard_schema.md)

### Top-Level Exports

#### `enforce.context()`

Retrieves the current validation context during a suite run. Useful within custom rules to access other fields in the data object.

- **Returns**: `{ data: Object, value: any, ... }`
- [Read more about Context Aware Rules](./enforce/creating_custom_rules.md#context-aware-rules)

#### `enforce.extend(customRules)`

Extends Vest's enforce with custom validation rules.

- **Tip**: To add TypeScript support for your custom rules, see [TypeScript Support](./typescript_support.md#custom-enforce-rules).

#### `rule.dependsOn(resolver)`

Returns a new rule with a direct dependency declared; the original rule is unchanged. The resolver receives a field-reference scope (`$`) and returns one reference or an array of references. Use `$.other` for a sibling field, `$.root.other` for a top-level field, and `$[FIELD]('name')` (from `n4s/relationships`) for fields named `root`, `parent` or `then`. The declaration affects `suite.changed()` planning; ordinary schema validation runs the rule as before. `dependsOn()` inside a recursive `lazy()` schema throws when the graph is described.

#### `schema.describe()` and `resolveAffected(schema, changed, data)`

After `import 'n4s/relationships'`, `schema.describe()` returns the declared graph as `relationships` with `source`, `target`, and `effect: 'invalidate'` entries. Import `resolveAffected` from `n4s/relationships` to compute concrete affected paths for the current data. `import 'vest/relationships'` also loads this graph implementation. Calling `describe()` without either entry throws a setup error.

- [Read the relationships guide](./guides/schema-relationships.md).

#### `memo(callback, deps, options?)`

Memoizes a block of tests.

- `callback`: The function to execute if dependencies change.
- `deps`: Array of dependencies determining if the callback executes.
- `options` (Optional): Configuration object with `cacheSize` (max cached results) and `ttl` (Time-to-Live in ms).

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

Sets the test's severity to warning in the synchronous part of a test.

- [Read more about `warn`](./writing_tests/warn_only_tests.md)

#### `useWarn()`

Returns a setter function that marks the current test as warning severity, including async flows after an `await`.

- [Read more about `useWarn`](./writing_tests/warn_only_tests.md)

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
- `getError(fieldName?)`: Without a field, returns the first summary object (`{ fieldName, message, groupName }`). With a field, returns that field's first error message string. Returns `undefined` when none exists.
- `getWarning(fieldName?)`: Without a field, returns the first summary object. With a field, returns that field's first warning message string. Returns `undefined` when none exists.
- `getMessage(fieldName)`: Returns the field's first error or warning message string, preferring an error when both exist.
- `getErrors(fieldName?)`: Without a field, returns an object whose keys are field names and values are arrays of message strings. With a field, returns that field's array of error message strings.
- `getWarnings(fieldName?)`: Without a field, returns an object whose keys are field names and values are arrays of message strings. With a field, returns that field's array of warning message strings.
- `hasErrorsByGroup(groupName)`: Returns true if the provided group has errors.
- `hasWarningByGroup(groupName)`: Returns true if the provided group has warnings.
- `getErrorsByGroup(groupName)`: Returns an object with errors in the provided group.
- `getWarningsByGroup(groupName)`: Returns an object with warnings in the provided group.
- `isPending(fieldName?)`: Returns true if the suite has pending async tests.
- `isTested(fieldName)`: Returns true if the provided field has been tested.
- `isValid(fieldName?)`: Returns true if the suite or the provided field is valid.
- `isValidByGroup(groupName)`: Returns true if a certain group or a field in a group is valid or not.
- `value`: The parsed schema output when the suite is valid. Typed as the schema's output type. `undefined` when invalid or when no schema is used.
- `types`: When a schema is present, an object with `input` and `output` properties typed from the schema. `undefined` when no schema is used.
- `run`: Metadata about the latest run, including `run.data.raw` (current run data), `run.data.parsed` (parsed data for the current run), and `run.time` (timestamp).
