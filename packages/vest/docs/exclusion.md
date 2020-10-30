# Excluding and including tests

When performing validations in real world-scenarios, you may need to only run tests of a single field in your suite, or skip certain tests according to some logic. That's why Vest includes `vest.skip()` and `vest.only()`.

`vest.skip()` and `vest.only()` are functions that take a name of the test, or a list of names to either include or exclude fields from being validated. They should be called from the body of suite callback, and in order for them to take effect, they should be called before anything else.

!> **NOTE** When using `vest.only()` or `vest.skip()` you must place them before any of the tests defined in the suite. Hooks run in order of appearance, which means that if you place your `skip` hook after the field you're skipping - it won't have any effect.

### Only running specific tests (including)

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

## Including and excluding groups of tests

Similar to the way you use `vest.skip` and `vest.only` to include and exclude tests, you can use `vest.skip.group` and `vest.only.group` to exclude and include whole groups.

These two functions are very powerful and give you control of whole portions of your suite at once.

```js
import vest, { test, group, enforce } from 'vest';

vest.create('authentication_form', data => {
  vest.skip.group(data.userExists ? 'signUp' : 'signIn');

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
      findUserName(data.username)
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

## Things to know about how these functions work:

**vest.only.group()**:
When using `vest.only.group`, other groups won't be tested - but top level tests that aren't nested in any groups will. The reasoning is that the top level space is a shared are that will always be executed. If you want only your group to run, nest everything else under groups as well.

If you combine `vest.only.group` with `vest.skip`, if you skip a field inside a group that is included, that field will be excluded during this run regardless of its group membership.

**vest.skip.group()**

If you combine `vest.skip.group` with `vest.only` your included field declared within the skipped tests will be ignored.