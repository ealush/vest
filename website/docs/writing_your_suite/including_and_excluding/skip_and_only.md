---
sidebar_position: 1
title: Including and Excluding Fields in Vest
description: Learn how to use skip() and only() functions in Vest to include or exclude fields from being validated.
keywords: [Vest, Skip, Only, exclude, include, validation framework, tests]
---

# Including or Excluding Fields in Vest Validation Framework

In real-world scenarios, you may need to run tests only on a specific field or skip some tests according to some logic. To handle such cases, Vest includes `skip()` and `only()` functions.

`skip()` and `only()` functions can exclude or include specific fields from being validated. These functions should be called from the body of suite callback and should be called before anything else to take effect.

:::danger IMPORTANT
When using `only()` or `skip()`, you must place them before any of the tests defined in the suite. Hooks run in order of appearance, which means that if you place your `skip` hook after the field you're skipping - it won't have any effect.
:::

## Only Running Specific Fields

When validating user interactions, you usually want to validate only the field that the user is currently interacting with, to prevent errors appearing for untouched inputs. You can use `only()` with the name of the test currently being validated to achieve this.

In the following example, we assume that the argument `fieldName` is being populated with the name of the field we want to test. If none is passed, the call to `only()` will be ignored, and all tests will run as usual. This allows us to test each field at a time during the interaction but test all on form submission.

```js
import { create, test, only } from 'vest';

const suite = create((data, fieldName) => {
  only(fieldName);

  test('username', 'Username is invalid', () => {
    /* some validation logic*/
  });
  test('email', 'Email is invalid', () => {
    /* some validation logic*/
  });
  test('password', 'Password is invalid', () => {
    /* some validation logic*/
  });
});

const validationResult = suite(formData, changedField);
```

:::tip Linking Related Fields to Run Together
You can make fields run together by using [include](./include). This is useful when you have fields that depend on each other, and you want to make sure they run at the same time.
:::

## Skipping Tests

There are cases when you may need to skip specific tests. For example, when you wish to prevent validation of a promo code when none provided. You can use the `skip()` function to skip the specified fields. All other tests will run as usual.

```js
import { create, test, skip } from 'vest';

const suite = create(data => {
  if (!data.promo) skip('promo');

  // this test won't run when data.promo is falsy.
  test('promo', 'Promo code is invalid', () => {
    /* some validation logic*/
  });
});

const validationResult = suite(formData);
```

By using `skip()` and `only()` functions in Vest, you can easily exclude or include fields from being validated, making your validation process more efficient and effective.
