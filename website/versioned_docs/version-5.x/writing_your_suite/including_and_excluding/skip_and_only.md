---
sidebar_position: 1
title: Including and Excluding Fields in Vest
description: Learn how to use skip() and only() functions in Vest to include or exclude fields from being validated.
keywords: [Vest, Skip, Only, exclude, include, validation framework, tests]
---

# Including or Excluding Fields in Vest Validation Framework

In real-world scenarios, you may need to run tests only on a specific field or skip some tests according to some logic. To handle such cases, Vest includes `skip()` and `only()` functions.

`skip()` and `only()` functions can exclude or include specific fields from being validated. These functions should be called from the body of suite callback and should be called before anything else to take effect.

Both skip and only can be used as many times as needed, and they can be nested within groups. skip and only will only take effect on the scope their declared in (and below), and only affect tests that are declared after their invocation.

:::caution
`skip()` and `only()` should not be called conditionally - i.e. inside of an if statement. Vest relies on the consistent execution of these functions in the suite to detect changes between runs.

Instead, you can conditionally supply your skip and only arguments. For example:

```js
skip(shouldSkip ? 'field1' : false);
```

```diff
- if (hasPromo) only('promo');
+ only(hasPromo && 'promo');
```

:::

## Skip and Only Arguments

Skip and Only take one argument, which can be one of the following:

- A string representing a field name
- An array of strings representing multiple field names
- `undefined` or `false` to prevent execution of the function
- **SKIP ONLY** `true` to skip or include all fields

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

## Skipping fields

There are cases when you may need to skip specific tests. For example, when you wish to prevent validation of a promo code when none provided. You can use the `skip()` function to skip the specified fields. All other tests will run as usual.

```js
import { create, test, skip } from 'vest';

const suite = create(data => {
  skip(data.promo ? 'promo' : false); // will skip the promo test if data.promo is falsy

  // this test won't run when data.promo is falsy.
  test('promo', 'Promo code is invalid', () => {
    /* some validation logic*/
  });
});

const validationResult = suite(formData);
```

By using `skip()` and `only()` functions in Vest, you can easily exclude or include fields from being validated, making your validation process more efficient and effective.

## Skipping or Including tests in a group

You can also use `skip()` and `only()` to skip or include tests in a group.

```js
import { create, group, test, skip, only } from 'vest';

const suite = create(data => {
  group('sign-in', () => {
    skip('password');

    test('username', 'Username is invalid', () => {
      /* ... */
    });

    test('password', 'Password is invalid', () => {
      /* ... */
    }); // This will be skipped
  });
});
```

```js
import { create, group, test, skip, only } from 'vest';

const suite = create(() => {
  group('sign-in', () => {
    only('password');

    test('username', 'Username is invalid', () => {
      /* ... */
    }); // This will be skipped

    test('password', 'Password is invalid', () => {
      /* ... */
    });
  });
});
```

## Skipping an entire group

You can also skip an entire group by passing a `true` to `skip()`.

```js
import { create, group, test, skip, only } from 'vest';

const shouldSkipSignIn = true;

const suite = create(data => {
  group('sign-in', () => {
    skip(shouldSkipSignIn);
    // now all tests in this group will be skipped
    test('username', 'Username is invalid', () => {
      /* ... */
    });

    test('password', 'Password is invalid', () => {
      /* ... */
    });
  });
});
```

## Combining Multiple Nesting Levels of Skip/Only

You can combine multiple nesting levels of skip() and only() to further refine which fields and tests are included or excluded. When skip() or only() is called at a higher level in the nesting hierarchy, it will affect all nested scopes unless overridden by subsequent skip() or only() calls.

```js
import { create, group, test, skip, only } from 'vest';

const suite = create(() => {
  only('field1');

  test('field1', 'Field 1 is invalid', () => {
    /* ... */
  });

  group('nested-group', () => {
    skip('field2');

    test('field1', 'Field 1 is invalid', () => {
      /* ... */
    });

    test('field2', 'Field 2 is invalid', () => {
      /* ... */
    }); // This test will be skipped
  });
});
```

In the above example, the only('field1') call at the top-level scope will only run tests for 'field1', including those within the nested group. However, the subsequent skip('field2') call within the nested group will skip the 'field2' test, overriding the only('field1') behavior.

By leveraging the flexibility of combining multiple levels of skip() and only(), you can precisely control which fields and tests are included or excluded, tailoring the validation process to your specific requirements.

Related: [include](./include)
