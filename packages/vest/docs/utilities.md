# Utilities and helpers

## `classNames` for simplifying UI code

After validating user input, you usually need to also indicate the validation result on the page - most of the times by adding a class to your input element. One of the difficulties you are likely to face is that the logic for setting the class is not always the negation of `hasErrors`.

```js
const addIsValidClass = !res.hasErrors('fieldName'); // this does not ALWAYS mean 'valid'
```

What about when the field is skipped or not validated yet? It does not have errors, so `res.hasErrors('fieldName')` will return `false`, and by that logic, you might mistakenly add a `is-valid` class to your element.

In this case you will also need to check if the test actually ran - so:

```js
const addIsValidClass = res.tests[fieldName] && !res.hasErrors('fieldName');
```

But this can get pretty cumbersome when added to multiple fields with different criteria (untested, invalid, hasWarning...).

This is what `vest/classNames` is for. It is a tiny utility function, that allows you to specify classnames to be added for each criteria.

The way it works is simple. You call `classNames` with your result object, and the list of classes you want to be added for whenever the field is tested, untested, has warning or is invalid. It then returns a function that when called with a field name, returns a space delimited string of classes. If more than one class applies (both tested and invalid, for example) they will both be added to the string.

```js
import classNames from 'vest/classNames';
import suite from './suite';

const res = suite(data);

const cn = classNames(res, {
  untested: 'is-untested', // will only be applied if the provided field did not run yet
  tested: 'some-tested-class', // will only be applied if the provided field did run
  invalid: 'my_invalid_class', // will only be applied if the provided field ran at least once and has an error
  valid: 'my_valid_class', // will only be applied if the provided field ran at least once does not have errors or warnings
  warning: 'my_warning_class', // will only be applied if the provided field ran at least once and has a warning
});

const fieldOneClasses = cn('field_1'); // "is-untested"
const fieldTwoClasses = cn('field_2'); // "some-tested-class my_invalid_class"
const fieldThreeClasses = cn('field_3'); // "some-tested-class my_warning_class"
```

## `any()` for OR relationship tests

`any` is a function within a package called `anyone` that was created for Vest in order to simplify repeating different kinds of inclusion and exclusion logic. If you want to use it, first you need to install it:

`npm install anyone`

Sometimes you need to have `OR` (`||`) relationship in your validations, this is tricky to do on your own, and `any()` simplifies this process.

The general rule for using `any()` in your validation is when you can say: "At least one of the following has to pass".

A good example would be: When your validated field can be either empty (not required), but when field - has to pass some validation.

### Usage

`any()` accepts an infinite number of arguments, all of which are functions. It returns a boolean, that can be used as the return value of a test function.

The only difference is - if any of the supplied tests passes, the success condition is met and `any()` returns true.

```js
import { test, enforce, create } from 'vest';
import { any } from 'anyone';

create(() => {
  test('coupon', 'When filled, must be at least 5 chars', () =>
    any(
      () => enforce(data.coupon).isEmpty(),
      () => enforce(data.coupon).longerThanOrEquals(5)
    )
  );
});
```

## `promisify()`

Promisify is a function that enables you to run your async validations as a [Javascript Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
This can be useful when running async validations on the server, or when you do not need the partial validation results.

!> **NOTE** The Promise is resolved when all tests finish running.

### Usage

`promisify()` accepts a validation suite declaration, and returns a function that when called, returns a Promise.

```js
import * as vest from 'vest';
import promisify from 'vest/promisify';

const suite = promisify(
  vest.create(data => {
    test('email', 'The email already exists', () => doesEmailExist(data.email));
    test('username', 'The username already exists', () =>
      doesUsernameExist(data.username)
    );
  })
);

suite(data).then(res => {
  if (res.hasErrors('email')) {
    /* ... */
  }

  if (res.hasErrors('username')) {
    /* ... */
  }
});
```
