# Shape and schema validation

Alongside the list of rules that only accept data provided by the user, enforce also supports compound rules - these are rules that accept other rules as their arguments. These rules let you validate more complex scenarios with the ergonomics of enforce.

- [enforce.anyOf() - either/or validations](#anyof)
- [enforce.shape() - Object's shape matching](#shape)
  - [enforce.optional() - nullable keys](#optional)
- [enforec.loose() - loose shape matching](#loose)
- [enforce.isArrayOf() - array shape matching](#isarrayof)

## enforce.anyOf() - either/or validations :id=anyof

Sometimes a value has more than one valid possibilities, `any` lets us validate that a value passes _at least_ one of the supplied rules.

```js
enforce(value).anyOf(enforce.isString(), enforce.isArray()).isNotEmpty();
// A valid value would either an array or a string.
```

## enforce.shape() - Lean schema validation. :id=shape

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

### enforce.optional() - nullable keys :id=optional

-- Optional can only be used within enforce.shape().

In regular cases, a missing key in the data object would cause an error to be thrown. To prevent that from happening, mark your optional keys with `enforce.optional`.

enforce.optional will pass validations of a key that's either not defined, undefined or null.

`enforce.optional` takes as its arguments all the rules that the value should pass - only if it is present. If it is not present in the data object.

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
      middle: enforce.optional(enforce.isString(), enforce.longerThan(3)),
    }),
  }),
});
```

## enforec.loose() - loose shape matching :id=loose

By default, shape will treat excess keys in your data object as validation errors. If you wish to allow support for excess keys in your object's shape, you can use `enforce.loose()` which is a shorthand to `enforce.shape(data, shape, { loose: true })`.

```js
enforce({ name: 'Laura', code: 'x23' }).shape({ name: enforce.isString() });
// 🚨 This will throw an error because `code` is not defined in the shape
```

```js
enforce({ name: 'Laura', code: 'x23' }).loose({ name: enforce.isString() });
// ✅ This will pass with `code` not being validated
```

## enforce.isArrayOf() - array shape matching :id=isarrayof

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

## enforce.oneOf()

enforce.oneOf can be used to determine if _exactly_ one of the rules applies. It will run against rule in the array, and will only pass if exactly one rule applies.

```js
enforce(value).oneOf(
  enforce.isString(),
  enforce.isNumber(),
  enforce.longerThan(1)
);

/*
value = 1      -> ✅ (value is a number)
value = "1"    -> ✅ (value is string)
value = [1, 2] -> ✅ (value is longer than 1)
value = "12"   -> 🚨 (value is both a string and longer than 1)
*/

```

