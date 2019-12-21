## Installation
To install the stable version of Vest:

```
npm install vest
```

You can also add Vest directly as a script tag to your page:

```html
<script src="https://unpkg.com/vest@1"></script>
```

## Writing tests
Writing Vest tests is very much like writing unit tests, with only slight differences. Instead of using `describe/it/expect`, you will use `validate/test/enforce`.

- `validate`: Your validation suite wrapper.
- `test`: A single validation unit, validating a field or a single value. It takes the name of the field being validated, a failure message (to display to the user), and a callback function that contains the validation logic. [Read more about test](./test).
- `enforce`: This is our assertion function. We’ll use it to make sure our validations pass. [Read more about enforce](./enforce).

The `validate` function takes the following arguments:

- `name`: The name of the current validation suite. Similar to a `describe` message.
- `callback`: The validation suite's body where your tests reside.

A simple validation suite would look somewhat like this:

```js
import { validate, test, enforce } from ‘vest’;

export default (data) => vest('NewUserForm', () => {
    test('username', 'Must be between 2 and 10 chars', () => {
        enforce(data.username)
            .longerThanOrEquals(2)
            .shorterThan(10);
    });

    test('password', 'Must contain at least one digit', () => {
        enforce(data.password)
            .matches(/(?=.*[0-9])/);
    });
});
```

In the above example, we validate a form called `NewUserForm` containing username and a password.

**Read next about:**
- [Vest's result object](./result).
- [Using the test function](./test).
- [Asserting with enforce](./enforce).
