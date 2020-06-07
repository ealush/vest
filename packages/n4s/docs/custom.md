# Custom enforce rules

To make it easier to reuse validations across your application, sometimes you would want to encapsulate bits of logic in rules that you can use later on, for example, "what's considered a valid email".

Your custom rules are essentially a single javascript object containing your rules.

```js
const myCustomRules = {
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, { key }) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
};
```

Just like the predefined rules, your custom rules can accepts two parameters:

- `value` The actual value you are testing against.
- `args` (optional) the arguments which you pass on when running your tests.

You can extend enforce with your custom rules by creating a new instance of `Enforce` and adding the rules object as the argument.

```js
import enforce from 'n4s';

const myCustomRules = {
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, key) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
};

enforce.extend(myCustomRules);

enforce(user.email).isValidEmail();
```
