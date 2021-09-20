# Context

Simple utility for context propagation within Javascript applications and libraries. Loosely based on the ideas behind React's context, allows you to achieve the same goals (and more) without actually using react.
It allows you to keep reference for shared variables, and access them down in your function call even if not declared in the same scope.

## API Reference

Context tries to mimic the behavior of Javascript scopes without actually being in the same scopes, and the API is built around context initialization, setting of values within the context and retrieving values.

### createContext()

Context's default export, it creates a context singleton object that can later be referenced.

```js
// ctx.js
import { createContext } from 'context';

export default createContext(); // { run: ƒ, bind: ƒ, use: ƒ, useX: ƒ }
```

createContext also accepts an initialization function that's run every time ctx.run is called. It allows intercepting the context initialization and adding custom logic, or default values.
The init function is passed the context object run was called with, and the parent context if it was called within a previously created context. The init function needs to return the desired context object.

```js
createContext((ctx, parentContext) => {
  if (parentContext === null) {
    // we're at the top level
    // so let's add a default cart object
    return Object.assign(ctx, {
      cart: [],
    });
  }

  // we're in a sub context, so we already have those default values.
  return ctx;
});
```

### run()

Runs a callback function within the context. It takes an object referencing the data you want to store within your context, and a callback function to run.

```js
// myFunction.js
import ctx from './ctx';
import sayUsername from './sayUsername';

function myFunction(username) {
  return ctx.run({ username }, sayUsername);
}
```

If `run` is called within a different `run` call, the context values will be merged when the callback is run. When we exit our callback, the context will be reset to the values it had before the call.

### use() and useX()

These are the main ways to access the context within your code. They return the current object that stored within the context, and differ in the way they handle calls outside of the context.

- use() returns the current object stored within the context, or null if we're not within a `run` call.
- useX() returns the current object stored within the context, or throws an error if we're not within a `run` call.
  - useX also takes an optional argument that will be used as the error message if the context is not found.

```js
// sayUsername.js
import ctx from './ctx';

function sayUsername() {
  const context = ctx.use(); // { username: 'John Doe' }

  if (!context) {
    // we're not within a `run` call. This function was called outside of a running context.
    return "Hey, I don't know you, and this is crazy!";
  }

  return `Hello, ${context.username}!`;
}
```

```js
// handleCart.js
import ctx from './ctx';

function handleCart() {
  const context = ctx.useX(
    'handleCart was called outside of a running context'
  ); // { cart: { items: [ 'foo', 'bar' ] } }
  // This throws an error if we're not within a `run` call.
  // You should catch this error and handle it somewhere above this function.

  return `You have ${context.cart.items.length} items in your cart.`;
}
```

### bind()

Bind a function to a context. It takes an object referencing the data you want to store within your context, and a callback function to run. It returns a function that can be called with the same arguments as the original function. The function will then internally call `run` with the same arguments, and return the result of the callback function, so it is useful if you want to reference a context after it was closed, for example - when running an async function.

```js
// getProductData.js
import ctx from './ctx';

function getProductData(productId) {
  return ctx.bind({ productId }, handleProductData);

  fetchProduct(productId).then(data => {
    handleProductData(data);
    // will run the function handleProductData within our context, even though there is no context running at the moment.
  });
}
```
