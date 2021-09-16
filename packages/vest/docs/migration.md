# Migration guides

## V3 to V4

Vest 4.0 is a major release that contains several breaking changes. Most should be pretty simple to migrate, but there are a few things that require a bit more attention.](https://

### Removed: Default import support

For better tree shaking, we removed the default import support. This means that if you need a part of the library, you will need to import it explicitly, resulting in a smaller eventual bundle size.

### V3

```js
import vest from 'vest';
```

### V4

```js
import * as vest from 'vest';
// OR:
import { create, test, enforce } from 'vest';
```

### Removed: Suite name from suite declaration

From now on, suites do not accept a name when being declared. The name used to serve a purpose in V2 when accessing properties from the suite, but it serves no purpose anymore.

#### V3

```js
import { create } from 'vest';

create('my-suite', () => {});
```

### V4

```js
import { create } from 'vest';

create(() => {});
```

### Renamed: classNames to classnames

Vest 3 included the `vest/classNames` import. It is now renamed to `vest/classnames`.

### V3

```js
import classNames from 'vest/classNames';
```

### V4

```js
import classnames from 'vest/classnames';
```

### Changed: Do not use if/else statements to conditionally run tests

Vest version 4 relies on order of execution and remembers the result of each test based on its location in the suite, similar to the way [hooks in react](https://reactjs.org/docs/hooks-rules.html) work. This means that tests wrapped in an if/else statement make Vest go out of sync with the suite order, and unexecuted test results will be recorded. Instead of using if/else statements, you should use the `skipWhen` function that achieves the same result.

### V3

```js
if (!suite.get().hasErrors('password')) {
  test('confirm', 'passwords do not match', () => {
    /*...*/
  });
}
```

### V4

```js
import { skipWhen, test } from 'vest';

// ...

skipWhen(suite.hasErrors('password'), () => {
  test('confirm', 'passwords do not match', () => {
    /*...*/
  });
});

// ...
```

**Note**
If you want to completely omit a test from your suite, and you know that it won't appear at all during the lifetime of your suite, you may use `if/else`.

### Removed: enforce.template

enforce.template was mostly a shorthand for a "and" style enforcements. In reality it did not provide any substantial functionality that was not achievable without it, while it contributed to confusion regarding the api.

## V2 to V3

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
  skipWhen(suite.get().hasErrors('username'), () => {
    /* ... */
  });
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
