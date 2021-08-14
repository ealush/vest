# Cross Field Validations

Sometimes it is not enough to only validate a field by itself, because its validity is dependant on the validity or invalidity of a different field.

Take for example the password confirmation field, by itself it serves no purpose, and as long as the password itself is not field, you might choose to not validate it to begin with. That's an **AND** relationship between fields. There can also be an **OR** relationship between fields, for example - either email address or phone number have to be filled, but neither is required as long the other was filled by the user.

All these cases can be easily handled with Vest in different ways, depending on your requirements and validation strategy.

## The Any utility

Your specific example can be handled with the `any` utility function. The `any` utility function takes a series of functions or expressions, and as long as at least one evaluates to `true`, it will mark your validation as passing.

There are two possible ways to use `any`:

### Use any to run one of multiple tests

the `any` utility will run each function until a passing test is found. This means that once one of the tests passes, the others won't run at all, saving you some performance.

Demo: https://codesandbox.io/s/demo-forked-tdj92?file=/src/validate.js

```js
import { create, test, enforce } from 'vest';
import any from 'vest/any';

export default create((data = {}) => {
  any(
    () =>
      test('email', 'Email or phone must be set', () => {
        enforce(data.email).isNotEmpty();
      }),
    () =>
      test('phone', 'Email or phone must be set', () => {
        enforce(data.phone).isNotEmpty();
      })
  );
});
```

### Use any to use different conditions in the same test

You could also use any within your test, if you have a joined test for both scenarios. This means that you have to return a boolean from your tests.

Demo: https://codesandbox.io/s/demo-forked-ltn8l?file=/src/validate.js

```js
import { create, test, enforce } from 'vest';
import any from 'vest/any';

export default create((data = {}) => {
  test('email_or_phone', 'Email or phone must be set', () =>
    any(
      () => {
        enforce(data.email).isNotEmpty();
        return true;
      },
      () => {
        enforce(data.phone).isNotEmpty();
        return true;
      }
    )
  );
});
```

## if/else for conditionally skipping fields

If your field depends on a different field's existence or a different simple condition, you could use a basic if/else statement.
In the following example I only validate `confirm` if password is not empty:

DEMO: https://codesandbox.io/s/demo-forked-z2ur9?file=/src/validate.js

```js
import { create, test, enforce } from 'vest';
export default create((data = {}) => {
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
  if (data.password) {
    test('confirm', 'Passwords do not match', () => {
      enforce(data.confirm).equals(data.password);
    });
  }
});
```

## if/else for conditionally skipping field based on a previous result

Sometimes you might want to run a certain validation based on the validation result of a previously run test, for example - only test for password strength if password DOESN'T have Errors. You could access the intermediate validation result and use it mid-run.

This requires using the function created from create():

```js
import { create, test, enforce, skipWhen } from 'vest';
const suite = create((data = {}) => {
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  skipWhen(suite.get().hasErrors('password'), () => {
    test('password', 'Password is weak', () => {
      enforce(data.password).longerThan(8);
    });
  });
});
export default suite;
```
