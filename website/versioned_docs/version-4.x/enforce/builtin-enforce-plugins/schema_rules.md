---
sidebar_position: 2
title: Schema Validation with Enforce
description: While less common when using Vest, sometimes it might be useful to validate a value against a schema. Vest comes with some schema validation rules that are handy for data-shape validation.
keywords:
  [Vest, schema, validation, rules, shape, optional, partial, loose, isArrayOf]
---

# Schema rules

While less common when using Vest, sometimes it might be useful to validate a value against a schema. Vest comes with some schema validation rules that are handy for data-shape validation.

To use it, simply import these rules in your project:

```js
import 'vest/enforce/schema';
```

These rules will then become available in `enforce`:

- [Schema rules](#schema-rules)
  - [enforce.shape() - Lean schema validation.](#enforceshape---lean-schema-validation)
    - [enforce.optional() - nullable values](#enforceoptional---nullable-values)
    - [partial() - allows supplying a subset of keys](#partial---allows-supplying-a-subset-of-keys)
    - [enforce.loose() - loose shape matching](#enforceloose---loose-shape-matching)
  - [enforce.isArrayOf() - array shape matching](#enforceisarrayof---array-shape-matching)

## enforce.shape() - Lean schema validation.

`enforce.shape()` validates the structure of an object.

```js
enforce({
  firstName: 'Rick',
  lastName: 'Sanchez',
  age: 70,
}).shape({
  firstName: enforce.isString(),
  lastName: enforce.isString(),
  age: enforce.isNumber(),
});
```

You may also chain your validation rules:

```js
enforce({
  age: 22,
}).shape({
  age: enforce.isNumber().isBetween(0, 150),
});
```

You may also nest calls to shape in order to validate a deeply nested object.

```js
enforce({
  user: {
    name: {
      first: 'Joseph',
      last: 'Weil',
    },
  },
}).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString(),
    }),
  }),
});
```

### enforce.optional() - nullable values

In regular cases, a missing value would cause a validation failure. To prevent that from happening, mark your optional keys with `enforce.optional`.

enforce.optional will pass validations of a key that's either not defined, undefined or null.

`enforce.optional` takes as its arguments all the rules that their value must pass.

```js
enforce({
  firstName: 'Rick',
  lastName: 'Sanchez',
}).shape({
  firstName: enforce.isString(),
  middleName: enforce.optional(enforce.isString()),
  lastName: enforce.isString(),
});
```

### partial() - allows supplying a subset of keys

When supplying a "shape" or a "loose" matcher, enforce requires at least the keys that are specified by the matcher, unless you manually wrap them with "optional". `partial` is a shorthand for applyong the `optional` modifier on all shape object keys. By wrapping the input of a matcher with `partial`, you can supply a subset of the keys that are required as if you had used `optional` on each key.

To be used, `partial` needs to be imported directly from `vest/enforce/schema`:

```js
import { partial } from 'vest/enforce/schema';
```

```js
enforce({}).shape(
  partial({
    firstName: enforce.isString(),
    lastName: enforce.isString(),
  }),
);
```

This won't throw because all the fields are now treated as optional.

### enforce.loose() - loose shape matching

By default, shape will treat excess keys in your data object as validation errors. If you wish to allow support for excess keys in your object's shape, you can use `enforce.loose()` which is a shorthand to `enforce.shape(data, shape, { loose: true })`.

```js
enforce({ name: 'Laura', code: 'x23' }).shape({ name: enforce.isString() });
// 🚨 This will throw an error because `code` is not defined in the shape
```

```js
enforce({ name: 'Laura', code: 'x23' }).loose({ name: enforce.isString() });
// ✅ This will pass with `code` not being validated
```

## enforce.isArrayOf() - array shape matching

enforce.isArrayOf can be used to determine the allowed types and values within an array. It will run against each element in the array, and will only pass if all items meet at least one of the validation rules.

```js
enforce([1, 2, 'hello!']).isArrayOf(enforce.isString(), enforce.isNumber());
```

You can also combine `isArrayOf` with other rules to validate other array properties:

```js
enforce(someArrayValue)
  .isArrayOf(enforce.isString(), enforce.isNumber().lessThan(3))
  .longerThan(2);
```

And as part of shape:

```js
enforce({ data: [1, 2, 3] }).shape({
  data: enforce.isArrayOf(enforce.isNumber()),
});
```
