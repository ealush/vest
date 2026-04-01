---
sidebar_position: 5
title: Schema Validation with Enforce
description: While less common when using Vest, sometimes it might be useful to validate a value against a schema. Vest comes with some schema validation rules that are handy for data-shape validation.
keywords:
  [Vest, schema, validation, rules, shape, optional, partial, loose, isArrayOf]
---

# Schema rules

While less common when using Vest, sometimes it might be useful to validate a value against a schema. Vest comes with some schema validation rules that are handy for data-shape validation.

To use it, simply use them in your project.

These rules are available in `enforce`:

- [enforce.shape() - Lean schema validation.](#enforceshape---lean-schema-validation)
  - [enforce.optional() - nullable values](#enforceoptional---nullable-values)
  - [enforce.partial() - allows supplying a subset of keys](#enforcepartial---allows-supplying-a-subset-of-keys)
  - [enforce.loose() - loose shape matching](#enforceloose---loose-shape-matching)
  - [enforce.pick() - pick a subset of fields](#enforcepick---pick-a-subset-of-fields)
  - [enforce.omit() - omit a subset of fields](#enforceomit---omit-a-subset-of-fields)
  - [enforce.isArrayOf() - array shape matching](#enforceisarrayof---array-shape-matching)
  - [enforce.record() - dynamic object matching](#enforcerecord---dynamic-object-matching)

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

### enforce.partial() - allows supplying a subset of keys

When supplying a "shape" or a "loose" matcher, enforce requires at least the keys that are specified by the matcher, unless you manually wrap them with "optional". `enforce.partial` is a shorthand for applyong the `optional` modifier on all shape object keys. By wrapping the input of a matcher with `enforce.partial`, you can supply a subset of the keys that are required as if you had used `optional` on each key.

```js
enforce({}).partial({
  firstName: enforce.isString(),
  lastName: enforce.isString(),
});
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

### enforce.pick() - pick a subset of fields

When you want to validate only a specific subset of fields from an existing schema, you can use `enforce.pick`. This rule validates only the designated fields, ignoring any extra keys present.

```js
enforce({ name: 'Laura', code: 'x23', internal: true }).pick(
  {
    name: enforce.isString(),
    code: enforce.isString(),
    internal: enforce.isBoolean(),
  },
  ['name', 'code'],
);
// ✅ This will pass, picking only the `name` and `code` fields for validation
```

### enforce.omit() - omit a subset of fields

When you want to validate an object against a schema but explicitly exclude certain fields from that validation, use `enforce.omit`. The second argument accepts a single key or an array of keys to omit.

```js
enforce({ name: 'Laura', code: 'x23' }).omit(
  {
    name: enforce.isString(),
    code: enforce.isNumber(),
  },
  'code',
);
// ✅ This will pass, validating `name` but skipping `code`

enforce({ name: 'Laura', code: 'x23', internal: true }).omit(
  {
    name: enforce.isString(),
    code: enforce.isNumber(),
    internal: enforce.isBoolean(),
  },
  ['code', 'internal'],
);
// ✅ This will pass, validating only `name` and skipping `code` and `internal`
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

## enforce.record() - dynamic object matching

When you need to validate objects acting as key-value mappings (where keys are dynamic), you can use `enforce.record()`. It allows you to validate all values, and optionally all keys, within an object.

```js
// Validating just values
const userRoles = { alice: 'admin', bob: 'editor' };
enforce(userRoles).record(enforce.isString());
```

```js
// Validating both keys and values
// The first argument is the key rule, the second is the value rule
const exactMapping = { user_123: true, user_456: false };
enforce(exactMapping).record(
  enforce.isString().matches(/^user_\d+$/),
  enforce.isBoolean(),
);
```

Just like `isArrayOf`, `record` can be nested in shapes or other arrays, and properly populates accurate error paths (e.g. `settings.darkMode`).

## Schema Parsing

Schema rules can also **transform** values using built-in data parsers. Parsers like `trim()`, `toNumber()`, and `toBoolean()` coerce data as it passes through the chain, and `schema.parse()` returns the fully transformed result.

```js
const schema = enforce.shape({
  name: enforce.isString().trim().toTitle(),
  age: enforce.isNumeric().toNumber().clamp(0, 120),
});

schema.parse({ name: '  jANE DOE ', age: '180' });
// → { name: 'Jane Doe', age: 120 }
```

See the full list of available parsers in [Data Parsers](./data_parsers.md).
