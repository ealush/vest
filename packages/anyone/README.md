# anyone

Utility helpers that answer simple boolean questions about a list of values or callbacks. Each helper evaluates the provided arguments left-to-right (calling functions to get their return value) and returns a boolean.

- `any` – returns `true` when at least one argument is truthy.
- `all` – returns `true` only when every argument is truthy.
- `one` – returns `true` when exactly one argument is truthy.
- `none` – returns `true` when no arguments are truthy.

All helpers accept any number of values. If an argument is a function, it will be executed and its return value is used in the check. Calls short-circuit as soon as the outcome is known (except for `one`, which must evaluate the whole list).

## Installation

```bash
npm i anyone
# or
yarn add anyone
```

## Usage

```js
import { any, one, all, none } from 'anyone';

const maybeTrue = () => true;
const alwaysFalse = () => false;

any(alwaysFalse, 0, 'value');
// → true ("value" is truthy)

all(1, maybeTrue, 'ok');
// → true

one(alwaysFalse, null, 5);
// → true (only the number is truthy)

none(alwaysFalse, 0, '', () => false);
// → true (no truthy values found)
```

You can also import the helpers individually:

```js
import any from 'anyone/any';
import one from 'anyone/one';
import all from 'anyone/all';
import none from 'anyone/none';
```
