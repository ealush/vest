# Cross Field Validations

Sometimes it is not enough to only validate a field by itself, because its validity is dependant on the validity or invalidity of a different field.

Take for example the password confirmation field, by itself it serves no purpose, and as long as the password itself is not field, you might choose to not validate it to begin with. That's an **AND** relationship between fields. There can also be an **OR** relationship between fields, for example - either email address or phone number have to be filled, but neither is required as long the other was filled by the user.

All these cases can be easily handled with Vest in different ways, depending on your requirements and validation strategy.

## skipWhen for conditionally skipping a test

Sometimes you might want to skip running a certain validation based on some criteria, for example - only test for password strength if password DOESN'T have Errors. You could access the intermediate validation result and use it mid-run.

```js
import { create, test, enforce } from 'vest';

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

## Optional tests

By default, all the tests inside Vest are required in order for the suite to be considered as "valid". Sometimes your app's logic may allow tests not to be filled out and you want them not to be accounted for in the suites validity. The optional utility allows you to specify logic to determine if a test is optional or not, for example - if it depends on a different test.

Read more in the [optional tests doc](./optional).
