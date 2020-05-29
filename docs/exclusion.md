# Excluding and including tests

When performing validations in real world-scenarios, you may need to only run tests of a single field in your suite, or skip certain tests according to some logic. That's why Vest includes `vest.skip()` and `vest.only()`.

`vest.skip()` and `vest.only()` are functions that take a name of the test, or a list of names to either include or exclude fields from being validated. They should be called from the body of suite callback, and in order for them to take effect, they should be called before anything else.

## Important to know before using exclusion hooks:

When using `vest.only()` or `vest.skip()` you must place them before any of the tests defined in the suite. Hooks run in order of appearance, which means that if you place your `skip` hook after the filed you're skipping - it won't have any effect.

### Only running specific tests

When validating upon user interactions, you will usually want to only validate the input the user currently interacts with to prevent errors appearing in unrelated places. For this, you can use `vest.only()` with the name of the test currently being validated.

In the example below, we're assuming the argument `fieldName` is being populated with the name of the field we want to test. If none is passed, the call to `only` will be ignored, and all tests will run as usual. This allows us to test each field at a time during the interaction, but test all on form submission.

```js
import vest, { enforce, test } from 'vest';

const validate = vest.create('New User', (data, fieldName) => {
  vest.only(fieldName);

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

const validationResult = validate(formData, changedField);
```

### Skipping tests

There are not many cases for skipping tests, but they do exist. For example, when you wish to prevent validation of a promo code when none provided.

In this case, and in similar others, you can use `vest.skip()`. When called, it will only skip the specified fields, all other tests will run as they should.

```js
import vest, { enforce, test } from 'vest';

const validate = vest.create('purchase', data => {
  if (!data.promo) {
    vest.skip('promo');
  }

  // this test won't run when data.promo is falsy.
  test('promo', 'Promo code is invalid', () => {
    /* some validation logic*/
  });
});

const validationResult = validate(formData);
```

**Read next about:**

- [Accessing intermediate suite result](./draft).
