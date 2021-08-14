# optional fields

> Since 3.2.0

It is possible to mark fields in your suite as optional fields. This means that when they are skipped, the suite may still be considered as valid.
All fields are by default required, unless explicitly marked as optional using the `optional` function.

## Usage

`optional` can take a field name as its argument, or an array of field names.

```js
import { optional, only, test, enforce, create } from 'vest';

const suite = create((data, currentField) => {
  only(currentField); // only validate this specified field

  optional(['pet_color', 'pet_age']);
  /** Equivalent to:
   * optional('pet_color')
   * optional('pet_age')
   **/

  test('pet_name', 'Pet Name is required', () => {
    enforce(data.name).isNotEmpty();
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

## Difference between `optional` and `warn`

While on its surface, optional might seem similar to warn, they are quite different.
optional, like "only" and "skip" is set on the field level, which means that when set - all tests of an optional field are considered optional. Warn, on the other hand - is set on the test level, so the only tests affected are the tests that have the "warn" option applied within them.

Another distinction is that warning tests cannot set the suite to be invalid.

There may be rare occasions in which you have an optional and a warning only field, in which case, you may combine the two.
