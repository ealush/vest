# Business related rules

Along with the existing rules, you might need different business related rules, for email, phone number, credit card validations, and more.

n4s uses [validator.js](https://github.com/validatorjs/validator.js) to provide some of these validations.

## Validator.js validations currently provided:

- isAlphanumeric
- isCreditCard
- isCurrency
- isEmail
- isIP
- isIdentityCard
- isJSON
- isLocale
- isMimeType
- isMobilePhone
- isPassportNumber
- isPostalCode
- isURL

Because these rules are business specific, and can have an impact on your bundle size, they are split into a their own bundle.

```js
import enforce from 'n4s/enforceExtended';

enforce('example@gmail.com').isEmail();
```

Some of these rules also require locale arrays and objects. These are also exported by the extended entry point:

```js
import enforce, {
  isAlphanumericLocales,
  isMobilePhoneLocales,
  isPostalCodeLocales,
} from 'n4s/enforceExtended';
```

To read the full documentation on these rules and the options they take, please visit [validator.js](https://github.com/validatorjs/validator.js).

### validator.js license:

```
Copyright (c) 2018 Chris O'Hara <cohara87@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
