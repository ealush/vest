# Grouping tests

In many cases it can be helpful to group tests together so you can include or exclude a portion of the suite with a single condition.
Similar to the `describe` and `context` features provided by unit testing frameworks, Vest provides `group`.

```js
import vest, { test, group, enforce } from 'vest';

vest.create('authentication_form', data => {
  vest.skip(data.userExists ? 'newUser' : 'existingUser');

  test('userName', "Can't be empty", () => {
    enforce(data.username).isNotEmpty();
  });
  test('password', "Can't be empty", () => {
    enforce(data.password).isNotEmpty();
  });

  group('existingUser', () => {
    test(
      'userName',
      'User does not exist. Please check if you typed it correctly.'
    );
  });

  group('newUser', () => {
    test('email', 'Email already registered', isEmailRegistered(data.email));

    test('age', 'You must be at least 18 years old to join', () => {
      enforce(data.age).largerThanOrEquals(18);
    });
  });
});
```

## Why use `group` and not just wrap the tests with an `if` statement?

In many cases it is sufficient to just use an `if` statement. The benefit of using `group` is that when skipping (either using [vest.skip or vest.only](./exclusion)), Vest will merge the previous group result with the current suite. This is mostly suitable for cases like demonstrated in the first example of the multi stage form.

## Use cases

### 1. Multi stage form

You may have in your application a multi-screen form, in which you want to validate each screen individually, but submit it all at once.

```js
// validation.js
import vest, { test, group, enforce } from 'vest';

const validate = vest.create('product-create', (data, currentTab) => {
  vest.only(currentScreen);

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

export default validate;
```

```js
// myFeature.js

validate(data, 'overview_tab'); // will only validate 'overview_tab' group
validate(data, 'pricing_tab'); // will only validate 'pricing_tab' group
```

### 2. Skipping tests with shared fields

You sometimes want to skip some tests on a certain condition, but still run other tests with the same field-name.

In the example below, we don't mind skipping the `balance` field directly, but if we skip the `quantity` field directly, it won't be tested at all - even though it has one test outside of the group. That's why we skip the `used_promo`.

```js
import vest, { test, group, enforce } from 'vest';

const validate = vest.create('checkout_form', data => {
  if (!data.usedPromo) {
    vest.skip('used_promo');
  }

  if (!data.paysWithBalance) {
    vest.skip('balance');
  }

  test(
    'balance',
    'Balance is lower than product price',
    hasSufficientFunds(data.productId)
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
      }
    );

    test(
      'promoCode',
      'Promo code can only be used once',
      isPromoCodeUsed(data.usedPromo)
    );
  });
});
```

## Querying the result object for groups

Groups represent a portion of your validation suite, so when using `group`, you are likely to need to get the group-specific validation results.
Your result object exposes the following methods:

- [_hasErrorsByGroup_](./result#haserrorsbygroup-and-haswarningsbygroup-functions)
- [_hasWarningsByGroup_](./result#haserrorsbygroup-and-haswarningsbygroup-functions)
- [_hasErrorsByGroup_](./result#geterrorsbygroup-and-getwarningsbygroup-functions)
- [_hasWarningsByGroup_](./result#geterrorsbygroup-and-getwarningsbygroup-functions)

Read more about these methods in [the result object](./result).
