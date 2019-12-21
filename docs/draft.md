# Accessing intermediate suite results
In some cases, you want to conditionally run tests based on the results of other tests. For example, preventing validating a field over the server when you already know the field is invalid.

For this you can use `vest.draft()`. The `traft` function returns the intermediate [result object](./result) of the currently running suite.

**Limitations when using vest.draft()**

- It is only possible to access intermediate test results for sync tests, and it is recommended to put all the async tests at the bottom of your suite so they have access to the result of all the sync tests.
- You may not call draft from outside a running suite. Doing that will result in a thrown error.

In the following example, we're preventing the async validation from running over the username field in case it already has errors.

```js
import vest, { test, enforce } from 'vest';

vest('NewUserForm', () => {
    test('username', 'Must be a string between 2 and 10 chars', () => {
        enforce(data.username).isString().longerThan(1).shorterThan(11);
    });

    if (!vest.draft().hasErrors('username')) {
        // if `username` did not pass the previous test, the following test won't run
        test('username', 'username already exists', () => doesTheUserExist(username));
    }
});
```
