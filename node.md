# Using Vest in node

Using Vest in node is mostly the same as it is in the browser, but you should consider your runtime.

## require vs import

Depending on your node version and the module system you support you can use different syntax to include Vest.

### Most compatible: commonjs

To be on the safe side and compatible with all node versions, use a `require` statement.

```js
const vest = require('vest');
const { test, enforce } = vest;
```

Depending on your node version and used flag, your require statement might default to Vest's minified es5 bundle. If you want to make sure to use the non-minified es6 commonjs bundle, you can require it directly.

```js
const vest = require('vest/vest.cjs.production.js');
const { test, enforce } = vest;
```

### For supported environments: esm

If you want to explicitly load Vest's esm module, you can import it directly:

```js
import vest, { test } from 'vest/esm/vest.mjs.js';
```

### Node 14

With node 14's support of [package entry points](https://nodejs.org/api/esm.html#esm_package_entry_points), node should be able to detect on its own which import style you use and load the correct bundle.

Both of the following should work:

```js
import vest, { test } from 'vest';
```

```js
const vest = require('vest');
```
