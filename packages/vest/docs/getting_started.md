# Installation

To install the stable version of Vest:

```
npm install vest
```

You can also add Vest directly as a script tag to your page:

```html
<script src="https://unpkg.com/vest@2"></script>
```

Vest tests are very much like unit tests, with only slight differences. Instead of using `describe/it/expect`, you will use `validate/[test](./test)/[enforce](./enforce)`.

- `test`: A single validation unit, validating a field or a single value. It takes the name of the field being validated, a failure message (to display to the user), and a callback function that contains the validation logic. [Read more about test].
- `enforce`: This is our assertion function. We’ll use it to make sure our validations pass. [Read more about enforce].

## Writing tests

First, you need to initialize your validation suite using `vest.create()`. This initializes your validation suite state and allows validation results to be merged with future validations.

```js
import vest from 'vest';

const validate = vest.create('formName', () => {
  // validation suite content goes here.
});

const validationResult = validate();
```

`vest.create()` takes the following arguments:

| Name     | Type       | Optional | Description                                                    |
| -------- | ---------- | -------- | -------------------------------------------------------------- |
| `name`   | `string`   | Yes      | Suite name.                                                    |
| callback | `function` | No       | Your validation suite's body. This is where your tests reside. |

vest.create returns a `validate` function which runs your validation suite. All the arguments you pass to it are being forwarded to your tests callback. You can use it to pass form data to your validation, excluded fields, and anything required for during your validation runtime.

A simple validation suite would look somewhat like this:

```js
// validation.js
import { test, enforce } from ‘vest’;

const validate = vest.create('NewUserForm', (formData) => {
    test('username', 'Must be between 2 and 10 chars', () => {
        enforce(formData.username)
            .longerThanOrEquals(2)
            .shorterThan(10);
    });

    test('password', 'Must contain at least one digit', () => {
        enforce(formData.password)
            .matches(/(?=.*[0-9])/);
    });
});

export default validate;
```

```js
// myFeature.js

import validate from './validation.js';

const res = validate(formData);
```

In the above example, we validate a form called `NewUserForm` containing username and a password.

**Read next about:**

- [Vest's result object](./result).
- [Using the test function](./test).
- [Asserting with enforce](./enforce).
