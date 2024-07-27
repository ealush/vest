---
sidebar_position: 3
title: Test Groups
description: In some cases it can be helpful to group tests together so you can include or exclude a portion of the suite with a single condition.
keywords: [Vest, Test Groups]
---

# Grouping tests

In some cases it can be helpful to group tests together so you can include or exclude a portion of the suite with a single condition.
Similar to the `describe` and `context` features provided by unit testing frameworks, Vest provides `group()`.

## Usage

There are two ways to use `group()`:

- **Named Groups** `group(name, callback)` - creates a new group with the given name and runs the tests inside the callback. Named groups are added to the result object, and can be queried for errors and warnings.
- **Unnamed Groups** `group(callback)` - Runs the tests inside the callback without creating a new group. This is useful for skipping tests, without changing the result object.

## Named Groups

```js
import { create, test, group, enforce } from 'vest';

create('suite_name', data => {
  group('group_name', () => {
    test('field_name', 'error_message', () => {
      enforce(data.field_name).equals('value');
    });
  });
});
```

## Unnamed Groups

```js
import { create, test, group, enforce } from 'vest';

create('suite_name', data => {
  group(() => {
    test('field_name', 'error_message', () => {
      enforce(data.field_name).equals('value');
    });
  });
});
```

# Full Example

```js
import { create, test, group, enforce, skip } from 'vest';

create(data => {
  test('userName', "Can't be empty", () => {
    enforce(data.username).isNotEmpty();
  });
  test('password', "Can't be empty", () => {
    enforce(data.password).isNotEmpty();
  });

  group('signIn', () => {
    skip(!data.userExists); // Skips the signin group if userExists is false
    test(
      'userName',
      'User not found. Please check if you typed it correctly.',
      findUserName(data.username),
    );
  });

  group('signUp', () => {
    skip(!!data.userExists); // Skips the signup group if userExists is true

    test('email', 'Email already registered', isEmailRegistered(data.email));

    test('age', 'You must be at least 18 years old to join', () => {
      enforce(data.age).largerThanOrEquals(18);
    });
  });
});
```

## Use cases

### 1. Multi-stage form

You may have in your application a multi-screen form in which you want to validate each screen individually but submit it all at once.

```js
// suite.js
import { create, test, group, enforce, only } from 'vest';

const suite = create((data, currentTab) => {
  group('overview_tab', () => {
    skip(currentTab !== 'overview_tab');

    test('productTitle', 'Must be at least 5 chars.', () => {
      enforce(data.productTitle).longerThanOrEquals(5);
    });

    test('productDescription', "Can't be longer than 2500 chars.", () => {
      enforce(data.productDescription).shorterThanOrEquals(2500);
    });

    test('productTags', 'Please provide up to 5 tags', () => {
      enforce(data.tags).lengthEquals(5);
    });
  });

  group('pricing_tab', () => {
    skip(currentTab !== 'pricing_tab');

    test('price', '5$ or more.', () => {
      enforce(data.price).lte(5);
    });

    test('productExtras', "Can't be empty.", () => {
      enforce(data.extras).isNotEmpty();
    });
  });
});

export default suite;
```

```js
// myFeature.js

suite(data, 'overview_tab'); // will only validate 'overview_tab' group
suite(data, 'pricing_tab'); // will only validate 'pricing_tab' group
```

### 2. Skipping only some of the tests of a given field

If we want to conditionally skip a portion of our suite, we can use `skip()` within a group.

```js
import { create, test, group, enforce, skip } from 'vest';

const suite = create(data => {
  // We want to always run this test, even if we skip the promo_code quantity test
  test('quantity', `Quantity on this item is limited to ${data.limit}`, () => {
    enforce(data.quantity).lessThanOrEquals(data.limit);
  });

  group('promo_code', () => {
    skip(!data.usedPromo); // Skips the group if usedPromo is false

    test(
      'quantity',
      'promo code purchases are limited to one item only',
      () => {
        enforce(data.quantity).equals(1);
      },
    );

    test(
      'promoCode',
      'Promo code can only be used once',
      isPromoCodeUsed(data.usedPromo),
    );
  });
});
```

## Querying the result object for groups

Named Groups represent a portion of your validation suite, so when using `group`, you are likely to need to get the group-specific validation results.
Your result object exposes the following methods:

- `hasErrorsByGroup(groupName, /*optional:*/ fieldName)`
- `hasWarningsByGroup(groupName, /*optional:*/ fieldName)`
- `hasErrorsByGroup(groupName, /*optional:*/ fieldName)`
- `hasWarningsByGroup(groupName, /*optional:*/ fieldName)`
- `isValidByGroup(groupName, /*optional:*/ fieldName)`

Read more about these methods in [the result object](../../writing_your_suite/accessing_the_result.md).
