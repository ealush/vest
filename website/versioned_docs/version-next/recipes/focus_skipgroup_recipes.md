---
sidebar_position: 3
title: Recipe - focus({ skip / skipGroup }) patterns
description: Practical patterns for combining suite.focus modifiers, with emphasis on skip vs skipGroup.
keywords: [Recipe, focus, skip, skipGroup, only, Vest]
---

# `focus({ skip / skipGroup })` Patterns

This recipe clarifies a common source of confusion:

- `skip` excludes by **field name**.
- `skipGroup` excludes by **group name**.

## Mental model

Use `skip` when the question is **"which field(s) should not run?"**.
Use `skipGroup` when the question is **"which validation section should not run?"**.

## Pattern 1: Skip one field everywhere

```js
suite.focus({ skip: 'email' }).run(formData);
```

This skips every `test('email', ...)`, regardless of whether it is top-level or nested in groups.

## Pattern 2: Skip one entire section

```js
suite.focus({ skipGroup: 'signUp' }).run(formData);
```

This skips all tests declared inside `group('signUp', ...)`, regardless of field names.

## Pattern 3: Validate one field and skip heavy checks

```js
suite
  .focus({ only: 'username', skipGroup: 'availabilityChecks' })
  .run(formData);
```

Useful for blur validation in forms where async checks are expensive.

## Pattern 4: Wizard step validation

```js
// run only step2 validations by skipping other groups
suite.focus({ skipGroup: ['step1', 'step3'] }).run(formData);
```

## Pattern 5: Combine both scopes

```js
suite.focus({ skip: 'password', skipGroup: 'billing' }).run(formData);
```

This skips all `password` tests globally and all tests in `billing` group.

## Pattern 6: Validating a Group's Fields only (`onlyGroup`)

```js
// Validate ONLY the 'step1' group.
// All other groups AND top-level tests are skipped.
suite.focus({ onlyGroup: 'step1' }).run(formData);
```

## See also

- [Focused Updates](../writing_your_suite/focused_updates)
- [Including and Excluding Fields](../writing_your_suite/including_and_excluding/skip_and_only)
