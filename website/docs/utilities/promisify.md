---
sidebar_position: 2
---

## `promisify()`

Promisify is a function that enables you to run your async validations as a [Javascript Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
This can be useful when running async validations on the server, or when you do not need the partial validation results.

:::tip NOTE
The Promise is resolved when all tests finish running.
:::

### Usage

`promisify()` accepts a validation suite declaration, and returns a function that when called, returns a Promise.

```js
import { create, test, skipWhen } from "vest";
import promisify from "vest/promisify";

const suite = promisify(
  create((data) => {
    test("email", "The email already exists", () => doesEmailExist(data.email));
    test("username", "The username already exists", () =>
      doesUsernameExist(data.username)
    );
  })
);

suite(data).then((res) => {
  if(res.hasErrors("email")) {
    /* ... */
  });

  if(res.hasErrors("username")) {
    /* ... */
  });
});
```
