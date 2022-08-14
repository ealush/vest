---
sidebar_position: 1
title: Skip and Only
description: Skip and Only allow to exclude and include fields in the suite.
keywords: [Vest, Skip, Only, exclude, include]
---

# including or excluding tests (only/skip)

When performing validations in real-world scenarios, you may need to only run tests of a single field in your suite, or skip some tests according to some logic. That's why Vest includes `skip()` and `only()`.

`skip()` and `only()` are functions that take a name of the test, or a list of names to either include or exclude fields from being validated. They should be called from the body of suite callback, and in order for them to take effect, they should be called before anything else.

:::danger IMPORTANT
When using `only()` or `skip()` you must place them before any of the tests defined in the suite. Hooks run in order of appearance, which means that if you place your `skip` hook after the field you're skipping - it won't have any effect.
:::

### Only running specific fields

When running validations upon user interactions, you will usually want to validate only the input the user currently interacts with, to prevent errors appearing for untouched inputs. For this, you can use `only()` with the name of the test currently being validated.

In the example below, we're assuming the argument `fieldName` is being populated with the name of the field we want to test. If none is passed, the call to `only` will be ignored, and all tests will run as usual. This allows us to test each field at a time during the interaction but test all on form submission.

```js
import { create, enforce, test, only } from 'vest';

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

:::tip Linking related fields so they run together
You can make fields run together by using [include](./include). This is useful when you have fields that depend on each other, and you want to make sure they run at the same time.
:::

### Skipping tests

There are not many cases for skipping tests, but they do exist. For example, when you wish to prevent validation of a promo code when none provided.

In this case, and in similar others, you can use `skip()`. When called, it will only skip the specified fields. All other tests will run as they should.

```js
import { create, enforce, test, skip } from 'vest';

const suite = create(data => {
  if (!data.promo) skip('promo');

  // this test won't run when data.promo is falsy.
  test('promo', 'Promo code is invalid', () => {
    /* some validation logic*/
  });
});

const validationResult = suite(formData);
```
