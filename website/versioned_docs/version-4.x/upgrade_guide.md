---
sidebar_position: 10
title: Upgrade guides
description: Guides for upgrading Vest
keywords: [Vest, Upgrade]
---

# Upgrade guides

## Upgrading from V3 to V4

Vest 4.0 is a major release that contains several breaking changes. Most should be pretty simple to migrate, but there are a few things that require a bit more attention.

### Removed: Default import support

For better tree shaking, we removed the default import support. This means that if you need a part of the library, you will need to import it explicitly, resulting in a smaller eventual bundle size.

#### V3

```js
import vest from 'vest';
```

#### V4

```js
import * as vest from 'vest';
// OR:
import { create, test, enforce } from 'vest';
```

### Renamed: classNames to classnames

Vest 3 included the `vest/classNames` import. It is now renamed to `vest/classnames`.

#### V3

```js
import classNames from 'vest/classNames';
```

#### V4

```js
import classnames from 'vest/classnames';
```

### Changed: Do not use if/else statements to conditionally run tests

Vest version 4 relies on order of execution and remembers the result of each test based on its location in the suite, similar to the way [hooks in react](https://reactjs.org/docs/hooks-rules.html) work. This means that tests wrapped in an if/else statement make Vest go out of sync with the suite order, and unexecuted test results will be recorded. Instead of using if/else statements, you should use the `skipWhen` function that achieves the same result.

#### V3

```js
if (!suite.get().hasErrors('password')) {
  test('confirm', 'passwords do not match', () => {
    /*...*/
  });
}
```

#### V4

```js
import { skipWhen, test } from 'vest';

// ...

skipWhen(
  res => res.hasErrors('password'),
  () => {
    test('confirm', 'passwords do not match', () => {
      /*...*/
    });
  },
);

// ...
```

### Replaced: test.each with each

[Read more on each](./writing_tests/advanced_test_features/dynamic_tests.md)

When writing dynamic validations, previous versions of Vest used `test.each` to run tests for each value in an array. test.each was very limited, and could only handle one test of the same field. It also was unable to retain state after reordering. test.each is now replaced with the more useful `each` function.

Now iterated tests require a `key` argument as their last argument, this guarantees state retention after reordering.

#### V3

```js
test.each(fields)(field.name, 'field is required', field => {
  enforce(field.value).isNotEmpty();
});
```

#### V4

```js
each(fields, field => {
  test(
    field.name,
    'field is required',
    () => {
      enforce(field.value).isNotEmpty();
    },
    field.id,
  );
});
```

### Replaced: enforce.template

enforce.template was a helpful function that allowed the composition of multiple validators. It is now replaced by the `compose` function, exported from `vest/enforce-compose`

- [read more](./enforce/composing_enforce_rules)

## Upgrading from V2 to V3

Vest version 3 comes with many new features, yet with a reduced bundle size. To achieve this, some redundant interfaces were removed. All v2 capabilities still exist, but the way to use some of them changed.

**Replaced interfaces**

### Removed: vest.get()

From now on, use suite.get() to get the latest validation result.

#### v2

```js
const suite = vest.create('user_form', () => {
  /*...*/
});

vest.get('user_form'); // Returns the most recent validation result
```

#### v3

```js
const suite = create(() => {
  /*...*/
});

suite.get(); // Returns the most recent validation result
```

### Removed: vest.reset() // To reset suite state

From now on, use suite.reset() to reset the validation result.

#### v2

```js
const suite = vest.create('user_form', () => {
  /*...*/
});

vest.reset('user_form'); // Resets the validity state
```

#### v3

```js
const suite = create(() => {
  /*...*/
});

suite.reset(); // Resets the validity state
```

### Removed: vest.draft() // To retrieve intermediate result

From now on, use suite.get() to get the validation result.

#### v2

```js
const suite = vest.create('user_form', () => {
  if (vest.draft().hasErrors('username')) {
    /* ... */
  }
});
```

#### v3

```js
const suite = create('user_form', () => {
  skipWhen(
    res => res.hasErrors('username'),
    () => {
      /* ... */
    },
  );
});
```

### Removed: validate() // For non persistent validations

The stateless validate export is not needed anymore due to a change in the state structure.

#### v2

```js
import { validate } from 'vest';

const result = data =>
  validate('user_form', () => {
    /*...*/
  })();
```

#### v3

```js
import { create } from 'vest';

const suite = data =>
  create(() => {
    /* ... */
  })();

const result = suite({ username: 'example' });
```
