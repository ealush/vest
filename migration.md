# Migration guides

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
const suite = vest.create(() => {
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
const suite = vest.create(() => {
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
const suite = vest.create('user_form', () => {
  if (suite.get().hasErrors('username')) {
    /* ... */
  }
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
import vest from 'vest';

const suite = data =>
  vest.create(() => {
    /* ... */
  })();

const result = suite({ username: 'example' });
```
