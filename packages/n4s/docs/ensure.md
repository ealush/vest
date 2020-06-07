# Not-throwing validations (ensure)

If you do not use a validations testing library but still want to use enforce [rules](./rules), you can use the ensure interface.

Ensure is similar to enforce, only that it returns a boolean value instead of throwing an error.

Since ensure has no way of knowing when you are done adding rules, you have to do that by putting the `.test()` function last with your value as its argument.

## Usage example

For example, if I want to test that the number 4 is both numeric, and is less than 5, I would:

```js
import { ensure } from 'n4s';

ensure().isNumeric().lessThan(5).test(4); // The value I am testing.
// `.test()` is always the last function passed

// returns true
```

## Custom rules

You can [extend](./custom) ensure in the same way you extend enforce.

```js
import ensure from 'n4s';

ensure.extend({
  isValidEmail: value => value.includes('@'),
});

ensure().isValidEmail().test('some invali dstring');

// returns false

ensure().isValidEmail().test('valid@email.com');

// returns true
```
