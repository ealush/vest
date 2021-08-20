# Creating Custom Rules

By default enforce comes with a list of rules that are available to be used. They intentionally do not cover all the cases that can be encountered in a real-world application but instead focus on the most common use cases.

## Inline logic with `condition`

Sometimes you would need to add some custom logic to your validation. For that you can use `enforce.condition` which accepts a function.

Your provided function will receive the enforced value, and returns either a boolean or a rule-return object.

```js
// Passes if the value is `1`
enforce(1).condition(value => {
  return value === 1;
});
```

```js
enforce(2).condition(value => {
  return {
    pass: value === 1,
    message: 'value must be one',
  };
});
```

## Reusable custom rules with enforce.extend

To make it easier to reuse logic across your application, sometimes you would want to encapsulate bits of logic in rules that you can use later on, for example, "what's considered a valid email".

Rules are called with the argument passed to enforce(x) followed by the arguments passed to `.yourRule(y, z)`.

```js
enforce.extend({
  yourRule(x, y, z) {
    return {
      pass: true,
      message: () => '',
    };
  },
});
```

```js
enforce.extend({
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, key) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
});

enforce(user.email).isValidEmail();
```

## Custom rules return value

Rules can either return boolean indicating success or failure, or an object with two keys. `pass` indicates whether the validation is successful or not, and message provides a function with no arguments that return an error message in case of failure. Thus, when pass is false, message should return the error message for when enforce(x).yourRule() fails.

```js
enforce.extend({
  isWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

## Traversing the object in your custom Rules

Sometimes you would need to traverse your enforced object from within your rule to get other values that are present at some other nesting level.

Let's assume we have a custom rule that makes its decision by factoring in two different values, one inside a nested object, and the other by a property in a parent object.

Consider this user object. It looks fine, but if you look closely, you'll see that our johndoe listed a friend with the same user name. This can't happen.

```js
{
  name: {
    first: 'John',
    last: 'Doe'
  },
  username: 'johndoe',
  friends: ['Mike', 'Jim', 'johndoe']
}
```

To access context you simply need to call `enforce.context()` within your custom rule. The function will return an object that matches this structure:

```
Object {
  "meta": Object {},
  "parent": [Function],
  "value": Object {},
}
```

- **value** contains the current value in the level you're at
- **meta** will contain the name of the current key if called within `shape` or `loose`, or `index` if called within `isArrayOf`.
- **parent** is a function that traverses up to the parent context, and you can access all its keys as if you're in that level. You can traverse up to the top level by chaining `parent` calls. When no levels left, parent will return `null`.

### Usage example

First, declare your custom rule in which you want to use a value that's higher up.
In the following example, we're getting the context, and checking if our `value` equals to the "username" that's defined two levels up.

```js
enforce.extend({
  isFriendTheSameAsUser: value => {
    const context = enforce.context();

    if (value === context.parent().parent().value.username) {
      return { pass: false };
    }

    return true;
  },
});
```

We'll use it like this:

```js
enforce({
  username: 'johndoe',
  friends: ['Mike', 'Jim', 'johndoe'],
}).shape({
  username: enforce.isString(),
  friends: enforce.isArrayOf(enforce.isString().isFriendTheSameAsUser()),
});
```
