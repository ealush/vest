---
sidebar_position: 13
title: Upgrade guides
description: Guides for upgrading Vest
keywords: [Vest, Upgrade]
---

# Upgrading from V5 to V6

Vest brings significant improvements to the API, focusing on better developer experience, type safety, and standard compliance.

## `create` returns a Suite Object

In V5, `create` returned a function that you would call directly to run the suite. In V6, `create` returns a **Suite Object** with methods like `.run()`, `.reset()`, and `.get()`.

```diff
- const suite = create(() => { ... });
- const result = suite(data);

+ const suite = create(() => { ... });
+ const result = suite.run(data);
```

## `suite.run()` returns a Promise-like Result

In V5, `suite()` returned the result object synchronously, and you had to use `promisify` or callbacks for async results. In V6, `suite.run()` returns a result object that is also a Promise.

```diff
- import { promisify } from 'vest';
- const runAsync = promisify(suite);
- const result = await runAsync(data);

+ const result = await suite.run(data);
```

## Removed `promisify` and `staticSuite`

These utilities have been removed in favor of the new Suite Object API.

- **promisify**: Use `await suite.run()` instead.
- **staticSuite**: Use `suite.runStatic()` instead.

```diff
- import { staticSuite } from 'vest';
- const suite = staticSuite(() => { ... });
- suite(data);

+ import { create } from 'vest';
+ const suite = create(() => { ... });
+ suite.runStatic(data);
```

## `test.memo` is now a top-level `memo` export

The memoization API has been promoted to a top-level export and can now wrap any part of the suite, not just single tests.

```diff
- import { create, test } from 'vest';
+ import { create, test } from 'vest';
+ import { memo } from 'vest/memo';

create(data => {
- test.memo('field', 'msg', () => { ... }, [data.field]);

+ memo(() => {
+   test('field', 'msg', () => { ... });
+ }, [data.field]);
});
```

## `done()` callback removed from Result

The `.done()` method on the result object has been removed. Use `suite.afterEach()` or `await suite.run()` instead.

```diff
- suite(data).done(result => { ... });

+ suite.afterEach(() => { ... }).run(data);
// OR
+ const result = await suite.run(data);
```

## Field-Focused Validation with `suite.focus()` and `suite.only()`

V6 introduces `suite.focus()` and `suite.only()` as the recommended way to run validation for specific fields. In V5, you had to pass the field name into the suite callback and call `only()` inside it. In V6, you declare what to focus on externally, keeping focus logic separate from validation logic.

```diff
- const suite = create((data, fieldName) => {
-   only(fieldName);
-   test('username', 'Username is required', () => { ... });
-   test('email', 'Email is required', () => { ... });
- });
- suite(formData, 'email');

+ const suite = create(data => {
+   test('username', 'Username is required', () => { ... });
+   test('email', 'Email is required', () => { ... });
+ });
+ suite.only('email').run(formData);
```

`suite.focus()` accepts a config object with `only`, `skip`, `onlyGroup`, and `skipGroup` modifiers, allowing you to combine multiple criteria in a single call:

```javascript
suite.focus({ only: 'email', skipGroup: 'signUp' }).run(formData);
```

`suite.only(field)` is a shorthand for `suite.focus({ only: field })`.

The V5 pattern of calling `only()` and `skip()` inside the callback still works, but the new suite-level methods are recommended for cleaner separation of concerns.

## Standard Schema Support

Vest implements the [Standard Schema](https://github.com/standard-schema/standard-schema) spec. You can now use Vest suites directly with libraries that support this standard.

```javascript
const result = await suite['~standard'].validate(data);
```

Compatible libraries normally invoke this hook for you. Continue to use `suite.run(data)` for stateful Vest execution and `suite.runStatic(data)` for independent server execution.

---

## Automated Migration Prompt

You can use the following prompt with an LLM (like ChatGPT or Claude) to help migrate your codebase from Vest 5 to Vest 6.

```markdown
I am migrating my Vest validation suites from version 5 to version 6. Please refactor the following code according to these rules:

1.  **Suite Creation**: `create` now returns a Suite Object, not a function.
    - Change `const suite = create(...)` to keep the same variable name.
    - Remove any suite name passed as the first argument to `create`.

2.  **Running Suites**:
    - Change `suite(data)` to `suite.run(data)`.
    - Change `staticSuite(...)` to `create(...)` and run it with `suite.runStatic(data)`.

3.  **Async Handling**:
    - Remove `import { promisify } from 'vest'`.
    - Remove `promisify(suite)`.
    - Change `await suite(data)` or `promisified(data)` to `await suite.run(data)`.
    - Remove `.done()` callbacks. Use `await suite.afterField('fieldName', callback)` or `suite.afterEach(callback)`.

4.  **Memoization**:
    - Change `test.memo(...)` to `memo(() => { test(...) }, deps)`.
    - Ensure `memo` is imported from 'vest/memo': `import { memo } from 'vest/memo';`.

5.  **Field-Focused Validation**:
    - If the suite callback accepts a second argument used with `only(fieldName)` inside the callback, refactor it to use `suite.only(fieldName).run(data)` or `suite.focus({ only: fieldName }).run(data)` at the call site instead.
    - Remove the extra callback parameter and the `only()` / `skip()` call from inside the callback body.
    - For group-level skipping, replace `skip(true)` inside `group()` with `suite.focus({ skipGroup: 'groupName' }).run(data)`.

6.  **General**:
    - Keep all validation logic intact.
    - Preserve comments.
```

---

# Upgrading from V4 to V5

### Migration guide

Vest 5 is mostly compatible with Vest 4, but some changes were made. In most cases, if you do not change anything, vest will keep working as it did before. However, to take advantage of the new features, you'll need to make some changes.

## Eager execution mode is now the default

In previous versions of Vest, Vest continued validating fields even after one of their tests had failed. V5 changes that to improve the runtime performance, and instead, Vest will halt further validations of a given field if it failed. This was an opt-in feature, and it can now be removed. [Read more on execution modes](./writing_your_suite/execution_modes.md).

```diff
- import {create, test, eager} from 'vest';
+ import {create, test} from 'vest';

const suite = create(() => {
- eager();

  test(/*...*/);
});
```

To bring back the previous behavior, use the `mode` function that alters the execution mode:

```diff
- import {create, test} from 'vest';
+ import {create, test, mode, Modes} from 'vest';

const suite = create(() => {
+ mode(Modes.ALL);

  test(/*...*/);
});
```

This also means that if you've used `skipWhen` to avoid running of failing fields, you can now remove it:

```diff
- import {create, test, skipWhen} from 'vest';
+ import {create, test} from 'vest';

const suite = create(() => {

- skipWhen(res => res.hasErrors('username'), () => {
    test('username', 'username already taken', () => {
      // ...
    });
- });
});
```

## All result methods are now available directly on the result object

In previous versions, you had to call `suite.get()` to access the different methods, such as `getErrors` and `isValid`. In V5, these methods are available directly on the result object returned from `suite.run()`. [Read more](./writing_your_suite/accessing_the_result.md).

```diff
- suite.get().getErrors('username');
+ result.getErrors('username');

- suite.get().isValid();
+ result.isValid();
```

## Added `hasError` and `hasWarning` methods

The result object has two new methods: hasError and hasWarning. They return a boolean value indicating whether a given field has an error or a warning. With these new methods, you can display the first error of a field. [Read more](./writing_your_suite/accessing_the_result.md).

```diff
- res.getError('username')
+ res.hasError('username')
```

## Removed skip.group and only.group

Vest 5 removes the dedicated group interface for skip and only, and instead allows you to call skip and only directly within the groups. [Read more](./writing_your_suite/including_and_excluding/skip_and_only.md).

```diff
const suite = create(() => {
- skip.group('group1', 'username');

  group('group1', () => {
+   skip('username');

    test('username', 'message', () => {
      // ...
    });
  });
});
```

```diff
const suite = create(() => {
- skip.group('group1');

  group('group1', () => {
+   skip(true);

    test('field1', 'message', () => {
      // ...
    });
  });
});
```

## Optional fields now take into account the suite params

In previous versions, optional fields only took into consideration whether the tests ran or not. In V5 optional fields also search the data object passed to the suite. If it has an object with the optional field in it, and the optional field is blank - the test will be considered valid even if it is not passing.

[Read more on optional fields](./writing_your_suite/optional_fields.md).

## Server side validations are built-in

In previous versions, as a user of Vest you had to set up your own state-reset mechanism. Vest now has a `staticSuite` export that does that for you. [Read more on Server Side Validations](./server_side_validations.md).

```diff
- import {create} from 'vest';
+ import {staticSuite} from 'vest';

- const suite = create(() => {/*...*/});
+ const suite = staticSuite(() => /*...*/});

- function ServerValidation() {
-  suite.reset();
-  suite.run();
- }
```

## First-Class-Citizen typescript support

All of Vest's methods are now typed and make use of generics to enforce correct usage throughout your suite. [Read More on TypeScript support](./typescript_support.md).

## Dropped support for \<ES2015

Vest 5 uses Javascript Proxies, which were introduced in ES2015. Therefore, Vest 5 no longer supports pre-ES2015 versions of Javascript. If you need to support older browsers, you can still use Vest 4.
