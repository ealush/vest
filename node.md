# Using Vest in node

Using Vest in node is mostly the same as it is in the browser, but there are a couple of things to note:

1. [`require` vs `import`](#require-vs-import) - which module system you use.
2. [use `validate` instead of `vest.create`](#use-validate) - prevent data leaks between user requests.

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
const vest = require('vest/vest.cjs.js');
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

## Use validate

By default Vest validations are stateful in order to reduce boilerplate code on the consumer side. This is usually fine, but in some cases, usually when performing server side validations, we would like our validations to be stateless - so that validation results do not leak between validation runs.

Writing stateless validations is just like writing stateful validations, only that instead of declaring your suite using `vest.create`, you directly import your validate function from Vest:

```js
const vest = require('vest');

const { validate, test, enforce } = vest;

module.exports = data =>
  validate('form_name', () => {
    test(/*...*/);
  });
```

In the example above, we import validate directly from Vest, and in each run it creates a temporary state that gets purged when the validation is finished.
