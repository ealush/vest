# Excluding and including tests

When performing validations in real world scenarios, you may need to only run tests of a single field in your suite, or skip certain tests according to some logic. That's why Vest includes `vest.skip()` and `vest.only()`.

`vest.skip()` and `vest.only()` are functions that take a name of test, or a list of names to either include or exclude fields from being validated. They should be called from the body of `validate` callback, and in order for them to take effect, they should be called before anything else.

Fields that were skipped (or not included when `only` was used) will appear in the [result object](./result) in the `skipped` array.

### Only running specific tests
When validating upon user interactions, you will usually want to only validate the input the user currently interacts with to prevent errors appearing in unrelated places. For this you can use `vest.only()` with the name of the test currently being validated.

In the example below we're assuming the argument `fieldName` is being populated with the name of the field we want to test. If none is passed, the call to `only` will be ignored, and all tests will run as usual. This allows us to test each field at a time during interaction, but test all on form submission.

```js
import vest, { validate, enforce, test } from 'vest';

const v = (data, fieldName) => validate('New User', () => {
    vest.only(fieldName);

    test('username', 'Username is invalid', () => {/* some validation logic*/});
    test('email', 'Email is invalid', () => {/* some validation logic*/});
    test('password', 'Password is invalid', () => {/* some validation logic*/});
});
```

### Skipping tests
There are not many cases for skipping tests, but they do exist. For example, when you with to prevent validation of a promo code when none provided.

In this case, and in similar others, you can use `vest.skip()`. When called, it will only skip the specified fields, all other tests will run as they should.

```js
import vest, { validate, enforce, test } from 'vest';

const v = (data) => validate('purchase', () => {
    if (!data.promo) {
        vest.skip('promo');
    }

    // this test won't run when data.promo is falsy.
    test('promo', 'Promo code is invalid', () => {/* some validation logic*/});
});
```

**Read next about:**
- [Accessing intermediate suite result](./draft).
