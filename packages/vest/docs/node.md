# Using Vest in node

Using Vest in node is mostly the same as it is in the browser, but you should consider your runtime.

## Validation state

When running your validations in your api, you usually want to have stateless validations to prevent leakage between requests.

Read more about [Vest's state](./state).

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
import { test, enforce } from 'vest';
```

```js
const vest = require('vest');
```
