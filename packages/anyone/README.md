# anyone

Anyone contains a small group of functions that check whether a number of given expressions evaluate to be truthy based on the number of times a truthy value appears.

Anyone has four functions:

- `any` - Checks that at least one of the supplied expressions evaluates to true.
- `one` - Checks that only one of the supplied expressions evaluates to true (Mutual exclusion).
- `all` - Checks that all of the supplied expressions evaluate to true.
- `none` - Checks that none of the supplied expressions evaluates to true.

They all accept any amount of arguments, or no arguments at all. If a function is passed, it will be run and its value will be evaluated. Return value is always a boolean.

All functions other than `one` will short circuit when realizing the condition is not met.

## Why use it

In most cases (other than `one`) you can do just fine using `Array.prototype.some` and `Array.prototype.every`, some of these functions are used internally by Vest.

- You can use these functions as conditionals:

```js
if (one(var1, var2, var3)) {
  // will reach here if ONLY ONE of the arguments is true
}
```

- You can use these functions to pause execution of some code after a condition is met

```js
all(
  validateInput1, // returns true
  validateInput2, // returns false
  validateInput3, // no need to run this, we already know our validation failed
);
```

## Installation

```js
npm i anyone
```

```js
yarn add anyone
```

## Usage Examples

```js
import { any, one, all, none } from 'anyone';
```

```js
import any from 'anyone/any';
import one from 'anyone/one';
import none from 'anyone/none';
import all from 'anyone/all';

any(
  someFunction, // evaluates to false
  1,
  someVar, // truthy
);
// true

// --------

any(
  someFunction, // evaluates to false
  0,
  someVar, // falsy
);
// false

// --------

one(
  someFunction, // evaluates to false
  0,
  someVar, // truthy
);
// true

// --------

none(
  someFunction, // evaluates to false
  1,
  someVar, // truthy
);
// false

// --------

none(
  someFunction, // evaluates to false
  0,
  someVar, // falsy
);
// true

// --------

all(
  someFunction, // evaluates to false
  0,
  someVar, // truthy
);
// false

// --------

all(
  someFunction, // evaluates to true
  1,
  someVar, // truthy
);
// true
```
