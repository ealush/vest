---
sidebar_position: 1
title: Utility - Classnames
description: Classnames is a utility function that allows you to create a classname string by the validation results.
keywords: [Vest, Classnames]
---

# classnames

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

This is what `vest/classnames` is for. It is a tiny utility function, that allows you to specify classnames to be added for each criteria.

The way it works is simple. You call `classnames` with your result object, and the list of classes you want to be added for whenever the field is tested, untested, has warning or is invalid. It then returns a function that when called with a field name, returns a space delimited string of classes. If more than one class applies (both tested and invalid, for example) they will both be added to the string.

```js
import classnames from 'vest/classnames';
import suite from './suite';

const res = suite(data);

const cn = classnames(res, {
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
