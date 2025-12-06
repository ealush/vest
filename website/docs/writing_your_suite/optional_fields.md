---
sidebar_position: 4
title: Optional fields
description: Learn how to specify optional fields in Vest, a library for writing validation tests in JavaScript. By default, all tests in a Vest suite are required, but sometimes you may want to skip certain tests. The `optional` function allows you to mark fields as optional, so that they are not accounted for in the suite's validity. Learn how to use the `optional` function, define custom optional rules, and the difference between `optional` and `warn`.
keywords:
  [
    optional fields,
    required fields,
    unfilled,
    validation tests,
    JavaScript,
    Vest library,
    custom optional rules,
    warning tests,
  ]
---

# Optional Fields

By default, all tests inside Vest are required for the suite to be considered "valid". However, there may be situations in which some tests can be skipped, such as when dealing with optional fields in your application's logic. In such cases, Vest provides the optional function, which allows you to mark fields as optional, so that they can be skipped during validation without affecting the overall validity of the suite.

An optional field is a field that can be omitted or left empty during validation without causing the entire suite to be considered invalid. When a field is marked as optional using the optional function, Vest will exclude it from the validation process unless specified otherwise.

Vest has a best-effort approach to determining whether an optional field should be applied.

## How Vest Determines Optional Fields

When a field is marked as optional using the `optional` function, Vest will consider the following:

## If the tests never ran

If the field was skipped in all runs of the suite, it will be considered as optional.

```js
import { create, optional, only, test, enforce } from 'vest';

const suite = create((data, currentField) => {
  only(currentField); // only validate this specified field

  optional(['pet_color', 'pet_age']);

  test('pet_name', 'Pet Name is required', () => {
    enforce(data.pet_name).isNotEmpty();
  });

  test('pet_color', 'If provided, pet color must be a string', () => {
    enforce(data.color).isString();
  });

  test('pet_age', 'If provided, pet age must be numeric', () => {
    enforce(data.age).isNumeric();
  });
});

suite({ name: 'Indie' }, 'pet_name').isValid(); // ✅ Since pet_color and pet_age are optional, the suite may still be valid
suite({ age: 'Five' }, 'pet_age').isValid(); // 🚨 When erroring, optional fields still make the suite invalid
```

## If the field is empty in the data object

If the first argument in the suite params is an object with the optional field as a key, and the value is `undefined`, `null`, or an empty string, it will be considered as optional.

:::caution NOTE
If the field is not present in the data object, or the first parameter is not the data object, Vest will default to the first option.
:::

```js
const suite = create(data => {
  optional('age');

  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('age', 'Age is invalid', () => {
    enforce(data.age).isNumber();
  });
});

const result = suite({
  username: 'John',
  age: '', // age is empty
});

result.isValid();
// ✅ Since we marked age as optional, the suite may still be valid
```

## Custom Omission Rules

Since every app is different, your app's logic may require some other definition of optional. For example, the user may have typed inside a field and then removed its content. In such cases, you can provide `optional` with a custom optional logic.

### Providing the field value for automatic omission

As mentioned in the previous section, Vest will try to determine whether a field should be omitted based on the value of the field in the data object. If the field value is coming from a different source, or is not the same key as its name in your tests (for example: `username` and `user_name`), you can supply the correct field value to Vest. If that value is blank (`''`, `null`, or `undefined`), the field will be omitted.

```js
const suite = create(data => {
  optional({
    // Here we tell vest to use the value of `user_name` instead of `username`
    // to determine if the field should be omitted.
    username: data.user_name,
  });

  test('username', 'Username is too short', () => {
    enforce(data.user_name).longerThanOrEquals(3);
  });
});
```

## Providing a function for custom omission

Sometimes the logic for optional field is more complex, for example - whether some other field has errors, or based on some other computed logic. In such cases, you can provide a function to Vest, which will be called with the data object and the current field name, and should return a boolean value indicating whether the field should be omitted.

The following code demonstrates how to allow a field to be empty if a different field is filled:

```js
const suite = create(data => {
  optional({
    pet_name: () => !suite.get().hasErrors('owner_name'),
    owner_name: () => !suite.get().hasErrors('pet_name'),
  });

  test(
    'pet_name',
    'Pet Name may be left empty only if owner name is supplied',
    () => {
      enforce(data.pet_name).isNotEmpty();
    },
  );

  test(
    'owner_name',
    'Owner Name may be left empty only if pet name is supplied',
    () => {
      enforce(data.owner_name).isNotEmpty();
    },
  );
});
```

## Difference between `optional` and `warn`

The difference between `optional` and `warn` is significant, despite their similar appearance. While `optional`, like `only` and `skip`, is applied to the entire field, making all tests optional, `warn` is set at the test level and only affects specific tests marked with the `warn` option.

Another notable distinction is that tests marked as warnings do not make the suite invalid.

In some rare instances, you might have a field that is both optional and a warning. In these cases, you can combine the two options.
