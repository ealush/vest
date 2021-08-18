# Enforce templates

When you have common patterns you need to repeat in multiple places, it might be simpler to store them as templates.

For example, let's assume that all across our systems, a username must be a non-numeric string that's longer than 3 characters.

```js
enforce(username).isString().isNotEmpty().isNotNumeric().longerThan(3);
```

This is quite simple to understand, but if you have to keep it up-to-date in every place you validate a username, you may eventually have inconsistent or out-of-date validations.

It can be beneficial in that case to keep this enforcement as a template for later use:

```js
const Username = enforce.template(
  enforce.isString().isNotEmpty().isNotNumeric().longerThan(3)
);
```

And then, anywhere else you can use your new `Username` template to validate usernames all across your application:

```js
Username('myUsername'); // passes
Username('1234'); // throws
Username('ab'); // throws
```

You can also use templates inside other compound rules, such as `shape`, `isArrayOf` ,`anyOf` or `allOf`.

```js
enforce({
  username: 'someusername',
}).shape({ username: Username });

enforce(['user1', 'user2']).isArrayOf(Username);
```

Templates can also be nested and composited:

```js
const RequiredField = enforce.template(enforce.isNotEmpty());
const NumericString = enforce.template(enforce.isNumeric().isString());

const EvenNumeric = enforce.template(
  RequiredField,
  NumericString,
  enforce.isEven()
);

EvenNumeric('10'); // passes
EvenNumeric('1'); // throws
```
