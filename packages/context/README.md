# Context 🪆

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![Version](https://badgen.net/npm/v/vest?&icon=npm)](https://www.npmjs.com/package/context) [![Downloads](https://badgen.net/npm/dt/context?label=Downloads)](https://www.npmjs.com/package/context) [![bundlephobia](https://badgen.net/bundlephobia/minzip/context)](https://bundlephobia.com/package/context) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

Simple utility for context propagation within Javascript applications and libraries. Loosely based on the ideas behind React's context, allows you to achieve the same goals (and more) without actually using react.
It allows you to keep reference for shared variables, and access them down in your function call even if not declared in the same scope.

## How Context Works?

The way context works is quite simple. Creating a context initializes a closure with a context storage object. When you run your context call, it takes your values, and places them in the context's closure. When your function finishes running, the context is cleared.

The reason the context is cleared after its run is so that items can't override one another. Assume you have two running the same async function twice, and it writes to the context, expecting to read the value somewhere down the line. Now you have two competing consumers of this single resource, and one eventually get the wrong value since they both read from and write to the same place.

## API Reference

### Top Level Exports

The context package exports these two functions:

- `createContext`: Creates a new context.
- `createCascade`: Creates a new cascading context.

## createContext()

Create context is the minimal implementation of context. It allows propagation of values down in your function call.

createContext takes a single argument - defaultContextValue. This value is used when not withing a running context.

### Arguments

| Argument            | Type  | Optional? | Description                                                  |
| ------------------- | ----- | --------- | ------------------------------------------------------------ |
| defaultContextValue | `any` | Yes       | The default value to use when not withing a running context. |

### Returned object

`createContext` returns an object containing the following functions:

- `use`: Returns the current context value, or the default value when not withing a running context.
- `useX`: Returns the current context, throws an error if not within a running context or the context is undefined. `useX` will throw even if a default value is provided.
- `run`: Runs the context, passing the given value into the context.

**Note About Typescript Usage**
For convenience, `use` assumes we're alwyas inside a context. If you want to have runtime safety, you can use `useX` instead to make sure you're excplicitly using a defined context.

### Usage Example

```js
const context = createContext(0); // Create a context with a default value of 0.

function myFunc() {
  context.run(100, someOtherFunc); // Run the context with a value of 100.
}

function someOtherFunc() {
  const number = context.use(); // Returns the value of the context.
}
```

## createCascade()

`createCascade` is a more advanced version of `createContext` that allows you to create cascading contexts. It assumes the value is always an object, and when nesting context layers, it merges their values together.

`createCascade` does not take a default value, but an initializer function instead. This initializer is called on each `run` call, and it allows you to modify or augment the context value being passed down. The init function is passed the context object run was called with, and the parent context if it was called within a previously created context. The init function needs to return the desired context object.

### Arguments

| Argument    | Type       | Optional? | Description                                                  |
| ----------- | ---------- | --------- | ------------------------------------------------------------ |
| initializer | `Function` | Yes       | The initializer function to use when creating a new context. |

The initializer function can either return the the next context object. If null is returned itself, the initializer will take no effect.
The initializer receives the context object, and the parent context object, if present.

### Returned object

`createCascade` returns an object containing the following functions:

- `use`: Returns the current context value.
- `useX`: Returns the current context, throws an error if not within a running context.
- `run`: Runs the context, passing the given value into the context. Merges the given value with the parent context if it exists, while not overriding the parent context.
- `bind`: Binds a given function to the context. Allows for delayd execution of a function as if it was called within the context.

### Usage Examples

#### Initializer Function

```js
createCascade((ctx, parentContext) => {
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

#### run()

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

## Typescript Support

both `createContext` and `createCascade` have full typescript support. To gain the full benefits of typescript within your context, it is best to annotate your context with its types:

```ts
const someContext = createContext<number>(0);

const someCascadeContext = createCascade<{
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
}>();
```

This meakes sure that all the functions (`run`, `use`, `useX` and `bind`) will be aware of these types, and either accept them as inputs, or add them to the return value.

## Troubleshooting

### Working with async functions/promises

Working with context inside within async code may lead to unexpected results when we don't fully consider what's happening. Trying to call your context from the async part of your code will probably return `null` instead of your values.

This is known and expected behavior. Context is a synchronous context propagation tool that completely relies on the synchronous nature of function calls in JS - this is exactly what allows context to run.

#### But my function is still running. Why did the context clear?

The async parts of your function are actually not executed along with your sync code, and even though you "await" it, the browser carries on and allows other code to run in between instead of blocking execution until your async code is complete.

#### Ok, so what do I do?

There are multiple strategies of handling async functions with context.

1. Pulling your values from context right before your async call
   This is the most obvious and easiest to achieve, though not always what you need. The basic idea is that you take whatever you need from the context when it is still available to you.

2. context.bind or context.run your async function to the context you extracted
   This is the next logical step - you have a function that you know should run later with your context. You can bind your context to it for delayed execution. When your function runs later down the line within your asynchronous code, internally it will still have access to whatever you bound to it.
