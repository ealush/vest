# Shape validations

Enforce (only, not ensure) comes with a built-in lean schema validator rule called `shape`. It allows you to use all the existing and custom rules of enforce to validate the shape of an object.

When using enforce rules inside your shape, use the rules that exist as properties on enforce itself (`enforce.isString()`). For rules used like this, rule chaining is not possible.

## Example

```js
enforce({
  firstName: 'Rick',
  lastName: 'Sanchez',
  age: 70
}).shape({
  firstName: enforce.isString(),
  lastName: enforce.isString(),
  age: enforce.isNumber()
});
```

## Testing multiple rules for the same key

To test multiple rules with the same key use an array of rules:

```js
enforce({
  age: 22
}).shape({
  age: [enforce.isNumber(), enforce.isBetween(0, 150)]
});
```

## Deeply nested data objects:

To deeply nest shape calls, just use them as any other rules inside shape:

```js
enforce({
  user: {
    name: {
      first: 'Joseph',
      last: 'Weil',
    }
  }
}).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString()
    })
  })
});
```

## Marking a field as optional

In regular cases, a missing key in the data object would cause an error to be thrown. To prevent that from happening, mark your optional keys with `enforce.optional`.

enforce.optional will pass validations of a key that's either not defined, undefined or null.

`enforce.optional` takes as its arguments all the rules that the value should pass - only if it is present. If it is not present in the data object.

```js
enforce({
  user: {
    name: {
      first: 'Joseph',
      last: 'Weil',
    }
  }
}).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString(),
      last: enforce.isString(),
      middle: enforce.optional(enforce.isString(), enforce.longerThan(3))
    })
  })
});
```