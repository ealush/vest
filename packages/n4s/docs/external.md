# Consuming external rules

Enforce comes with the bare minimum of rules needed for input validation, not assuming your business logic constraints.

In some cases you might require more validations such as `isEmail` or `isPhoneNumber`. Enforce intentionally does not include those, since those validations may not necessarily reflect the way those validations should work in your app.

Luckily, there are numerous packages that can be used along with enforce to add those validations. One of the most popular, and most compatible is `validator.js`.

```
npm i validator
```

Validator.js is a pretty big package. To prevent it from unnecessarily increasing your bundle size for rules you don't use, import the ones you use individually.

Then add those rules with `enforce.extend`:

```js
import isEmail from 'validator/es/lib/isEmail';
import isMobilePhone from 'validator/es/lib/isMobilePhone';

enforce.extend({ isEmail, isMobilePhone });

enforce('example@example.com').isEmail(); // ✅
enforce('example[at]example[dot]com').isEmail(); // 🚨
```

A full list of the supported validator.js rules can be found on [npmjs.com/package/validator](https://www.npmjs.com/package/validator).
