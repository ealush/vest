---
sidebar_position: 11
title: Server Side Validation
description: Learn how to use the Vest with Node.js
keywords:
  [
    Server side validation,
    Node.js,
    Validation state,
    Stateful vs stateless,
    staticSuite,
    Resetting the suite,
    require,
    import,
    CommonJS,
    Package entry points,
  ]
---

# Server Side Validation

Using Vest in node is mostly the same as it is in the browser, but you should consider your runtime.

## Validation state

When running your validations on the server, you want to keep each request isolated with its own state, and not update the same validation state between requests. Doing that can cause failed validations to seem successful or vice versa due to different requests relying on the same state. [Read more in the Understanding Vest's state section](./understanding_state.md).

### Solution: Treat validations as stateless

While when on the browser you usually want to treat validations as stateful - even though it might sometimes not be the case - on the server you almost always want to treat your validations as stateless.

#### Option 1: Using a staticSuite

Another option is to use a `staticSuite` instead of a regular suite. A `staticSuite` is a suite that creates a new suite result instance each time it's called, and doesn't take into account the previous validation runs. This means that each time a `staticSuite` is called, a new result object will be created:

```js
import { staticSuite, test, enforce } from 'vest';

const suite = staticSuite(data => {
  test('username', 'username is required', () => {
    enforce(data.username).isNotEmpty();
  });
});

suite(data);
```

In the example above, `suite` is a function that runs the validations, similar to the output of `vest.create`. Note that since the `staticSuite` creates a new result instance each time it's called, there's no need to reset the suite between runs.

#### Option 2: Resetting the suite between runs

One option is to reset the entire suite before each run:

```js
import { create } from 'vest';

function serversideCheck(data) {
  const suite = create(() => {
    test('username', 'username is required', () => {
      enforce(data.username).isNotEmpty();
    });
  });

  suite();
  suite.reset();
}
```

## require vs import

Depending on your node version and the module system you support you can use different syntax to include Vest.

### Most compatible: commonjs

To be on the safe side and compatible with all node versions, use a `require` statement.

```js
const vest = require('vest');
const { test, enforce } = vest;
```

### Node 14

With node 14's support of [package entry points](https://nodejs.org/api/esm.html#esm_package_entry_points), node should be able to detect on its own which import style you use and load the correct bundle.

Both of the following should work:

```js
import { create, test } from 'vest';
```

```js
const vest = require('vest');
```
