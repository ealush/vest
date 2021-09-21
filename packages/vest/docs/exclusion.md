# Excluding and including tests

When performing validations in real world-scenarios, you may need to only run tests of a single field in your suite, or skip certain tests according to some logic. That's why Vest includes `skip()` and `only()`.

`skip()` and `only()` are functions that take a name of the test, or a list of names to either include or exclude fields from being validated. They should be called from the body of suite callback, and in order for them to take effect, they should be called before anything else.

!> **NOTE** When using `only()` or `skip()` you must place them before any of the tests defined in the suite. Hooks run in order of appearance, which means that if you place your `skip` hook after the field you're skipping - it won't have any effect.

### Only running specific tests (including)

When validating upon user interactions, you will usually want to only validate the input the user currently interacts with to prevent errors appearing in unrelated places. For this, you can use `only()` with the name of the test currently being validated.

In the example below, we're assuming the argument `fieldName` is being populated with the name of the field we want to test. If none is passed, the call to `only` will be ignored, and all tests will run as usual. This allows us to test each field at a time during the interaction, but test all on form submission.

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

### Skipping tests

There are not many cases for skipping tests, but they do exist. For example, when you wish to prevent validation of a promo code when none provided.

In this case, and in similar others, you can use `skip()`. When called, it will only skip the specified fields, all other tests will run as they should.

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

## skipWhen: Conditionally excluding portions of the suite

In some cases we might need to skip a test or a group based on a given condition, for example - based on the intermediate state of the currently running suite. To allow this, can use `skipWhen`. `skipWhen` takes a boolean expression and a callback with tests.
If the expression is true, the tests within the callback will be skipped. Otherwise, the tests will run as normal.

In the following example we're skipping the server side verification of the username if the username is invalid to begin with:

```js
import { create, test, enforce, skipWhen } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  skipWhen(suite.get().hasErrors('username'), () => {
    test('username', 'Username already exists', () => {
      // this is an example for a server call
      return doesUserExist(data.username);
    });
  });
});
export default suite;
```

!> **Note** Using suite.get() within the suite runs returns a **DRAFT** result. This means that it may not contain the final validation result.

## Including and excluding groups of tests

Similar to the way you use `skip` and `only` to include and exclude tests, you can use `skip.group` and `only.group` to exclude and include whole groups.

These two functions are very powerful and give you control of whole portions of your suite at once.

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

**only.group()**:
When using `only.group`, other groups won't be tested - but top level tests that aren't nested in any groups will. The reasoning is that the top level space is a shared are that will always be executed. If you want only your group to run, nest everything else under groups as well.

If you combine `only.group` with `skip`, if you skip a field inside a group that is included, that field will be excluded during this run regardless of its group membership.

**skip.group()**

If you combine `skip.group` with `only` your included field declared within the skipped tests will be ignored.
