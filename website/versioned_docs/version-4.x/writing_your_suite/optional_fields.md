---
sidebar_position: 4
title: Optional fields
description: By default, all the tests inside Vest are required in order for the suite to be considered as "valid". Learn how to specify optional fields.
keywords: [optional fields, required fields, unfilled]
---

# optional fields

By default, all the tests inside Vest are required in order for the suite to be considered as "valid". Sometimes your app's logic may allow tests not to be filled out, and you want them not to be accounted for in the suites validity.

For cases like this, Vest provides the `optional` function which allows you to mark a field, or multiple fields as optional. Vest's definition of "optional" is that the field did not have any test runs in the lifetime of the suite.

If your app requires custom logic, please see the advanced section below.

## Basic Usage - allowing tests not to run

`optional` can take a field name as its argument or an array of field names.

```js
import { create, optional, only, test, enforce } from 'vest';

const suite = create((data, currentField) => {
  only(currentField); // only validate this specified field

  optional(['pet_color', 'pet_age']);
  /** Equivalent to:
   * optional('pet_color')
   * optional('pet_age')
   **/

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

suite({ name: 'Indie' }, /* -> only validate pet_name */ 'pet_name').isValid();
// ✅ Since pet_color and pet_age are optional, the suite may still be valid

suite({ age: 'Five' }, /* -> only validate pet_age */ 'pet_age').isValid();
// 🚨 When erroring, optional fields still make the suite invalid
```

## Custom omission rules

Since every app is different, your app's logic may require some other definition of optional. An example would be that the user typed inside the field and then removed its content, or - if a field may only be empty when a different field is supplied - Vest cannot be aware of this logic, and you will have to tell Vest to conditionally omit the results for this field by providing `optional` with a custom omission rule.

To provide a custom optional rule, instead of passing a list of fields, you need to provide an object with the field names as its keys, and either a boolean or a function returning a boolean as its value. These rules will be evaluated immediately, and then again after your suite finishes its **synchronous** run. When true, Vest will omit _ALL_ failures your field might have from the suite.

:::danger IMPORTANT - ASYNC TESTS ARE UNSUPPORTED WITH CUSTOM OPTIONAL RULES
You should avoid using the custom omission rules along with async tests. This is unsupported and may cause unexpected behavior. The reason for this limitation is due to the fact that the omission conditionals are calculated at the end of the suite, while the async tests may keep running. Allowing it will require re-calculation for each async test that finishes, which could be expensive.
:::

```js
optional({
  fieldName: true, // omit all failures for this field
  fieldName2: () => true, // omit all failures for this field
});
```

### Examples

**An example allowing a field to be empty even if its `touched` or `dirty`**

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

**An example allowing a field to be empty if a different field is filled**

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

While on its surface, optional might seem similar to warn, they are quite different.
Optional, like "only" and "skip" is set on the field level, which means that when set - all tests of an optional field are considered optional. Warn, on the other hand - is set on the test level, so the only tests affected are the tests that have the "warn" option applied within them.

Another distinction is that warning tests cannot set the suite to be invalid.

There may be rare occasions in which you have an optional and a warning only field, in which case, you may combine the two.
