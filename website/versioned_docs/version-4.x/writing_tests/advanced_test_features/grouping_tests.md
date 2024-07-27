---
sidebar_position: 3
title: Test Groups
description: In some cases it can be helpful to group tests together so you can include or exclude a portion of the suite with a single condition.
keywords: [Vest, Test Groups]
---

# Grouping tests

In some cases it can be helpful to group tests together so you can include or exclude a portion of the suite with a single condition.
Similar to the `describe` and `context` features provided by unit testing frameworks, Vest provides `group`.

[Try on CodeSandbox (React)](https://codesandbox.io/s/vest-group-example-react-4i2ne)

```js
import { create, test, group, enforce, skip } from 'vest';

create(data => {
  skip.group(data.userExists ? 'signUp' : 'signIn');

  test('userName', "Can't be empty", () => {
    enforce(data.username).isNotEmpty();
  });
  test('password', "Can't be empty", () => {
    enforce(data.password).isNotEmpty();
  });

  group('signIn', () => {
    test(
      'userName',
      'User not found. Please check if you typed it correctly.',
      findUserName(data.username),
    );
  });

  group('signUp', () => {
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
  only.group(currentTab);

  group('overview_tab', () => {
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

### 2. Skipping tests with shared fields

You sometimes want to skip some tests on a certain condition but still run other tests with the same field-name.

In the example below, we don't mind skipping the `balance` field directly, but if we skip the `quantity` field directly, it won't be tested at all - even though it has one test outside of the group. That's why we skip the `used_promo`.

```js
import { create, test, group, enforce, skip } from 'vest';

const suite = create(data => {
  if (!data.usedPromo) skip.group('used_promo');
  if (!data.paysWithBalance) skip.group('balance');

  test(
    'balance',
    'Balance is lower than product price',
    hasSufficientFunds(data.productId),
  );

  test('quantity', `Quantity on this item is limited to ${data.limit}`, () => {
    enforce(data.quantity).lessThanOrEquals(data.limit);
  });

  group('used_promo', () => {
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

Groups represent a portion of your validation suite, so when using `group`, you are likely to need to get the group-specific validation results.
Your result object exposes the following methods:

- hasErrorsByGroup
- hasWarningsByGroup
- hasErrorsByGroup
- hasWarningsByGroup

Read more about these methods in [the result object](../../writing_your_suite/result_object.md).
