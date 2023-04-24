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

By default, all tests inside Vest are required for the suite to be considered "valid". However, there may be situations in which some tests can be skipped, such as when dealing with optional fields in your application's logic. In such cases, Vest provides the `optional` function, which allows you to mark fields as optional, so that they are not accounted for in the suite's validity.

Vest's definition of "optional" is that the field did not have any test runs in the lifetime of the suite. If your app requires custom logic, you can define your custom rules for omission.

## Basic Usage - Allowing Tests Not to Run

The `optional` function can take a field name as its argument or an array of field names. For example, the following code specifies that `pet_color` and `pet_age` fields are optional:

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

## Custom Omission Rules

Since every app is different, your app's logic may require some other definition of optional. For example, the user may have typed inside a field and then removed its content. In such cases, you can provide `optional` with a custom omission rule.

To provide a custom optional rule, you need to provide an object with the field names as its keys, and either a boolean or a function returning a boolean as its value. These rules will be evaluated immediately, and then again after your suite finishes its **synchronous** run. When true, Vest will omit _ALL_ failures your field might have from the suite. It is important to note that custom omission rules are not supported for asynchronous tests.

The following code demonstrates an example of how to allow a field to be empty even if it's "touched" or "dirty":

```js
const suite = create(data => {
  optional({
    pet_name: !data.pet_name,
  });

  test('pet_name', 'Pet Name may be left empty', () => {
    enforce(data.pet_name).isNotEmpty();
  });
});
```

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
    }
  );

  test(
    'owner_name',
    'Owner Name may be left empty only if pet name is supplied',
    () => {
      enforce(data.owner_name).isNotEmpty();
    }
  );
});
```

:::danger IMPORTANT - ASYNC TESTS ARE UNSUPPORTED WITH CUSTOM OPTIONAL RULES
You should avoid using the custom omission rules along with async tests. This is unsupported and may cause unexpected behavior. The reason for this limitation is due to the fact that the omission conditionals are calculated at the end of the suite, while the async tests may keep running. Allowing it will require re-calculation for each async test that finishes, which could be expensive.
:::

## Difference between `optional` and `warn`

The difference between `optional` and `warn` is significant, despite their similar appearance. While `optional`, like `only` and `skip`, is applied to the entire field, making all tests optional, `warn` is set at the test level and only affects specific tests marked with the `warn` option.

Another notable distinction is that tests marked as warnings do not make the suite invalid.

In some rare instances, you might have a field that is both optional and a warning. In these cases, you can combine the two options.
