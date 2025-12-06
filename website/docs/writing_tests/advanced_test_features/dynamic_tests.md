---
sidebar_position: 2
title: Dynamically adding tests by iterating over an array
description: Vest allows you to add tests dynamically by iterating over an array.
keywords: [Vest, dynamically, adding, tests, iterating, array]
---

# Dynamic Tests with `each`

> This replaces Vest's test.each which used to have limited capabilities.

A common use case in forms is to have fields that are added dynamically via the user interface. These fields may have multiple validations of their own, and their amount and order may change via the lifetime of the suite.

To handle these dynamic tests, you may use the `each` function provided by Vest. It accepts an array of values, and a callback. It then iterates over each of the array items, and runs the provided callback, similarly to a `forEach` call.

Within your `each` callback you can add your tests. It is recommended that you add each tests a unique "key" prop as the last argument. This will guarantee correct behavior when tests are removed, or their order changes.

If you have just one test of each field (= the field name is a unique value), you can use the field name as the key as well.

```js
import { create, test, each, enforce } from 'vest';

/*
data.fields = [
  {
    name: 'GameBoy Color',
    price: 200,
    id: "gb-color"
  },
  {
    name: 'GameBoy Advance',
    price: 300,
    id: "gb-advance"
  },
  {
    name: 'Nintendo 64',
    price: 400,
    id: "n64"
  },
]
*/

const suite = create((data = {}) => {
  each(data.fields, field => {
    test(
      field.name,
      'item price must be greater than 0',
      () => {
        enforce(field.price).isNumeric().greaterThan(0);
      },
      field.id, // the key is used to guarantee state persistence on reordering
    );
  });
});
```

:::tip The Key Prop
When using the key argument, make sure you use a consistent key to the test itself, and avoid values that may change between runs - such as the item's index.
If you have multiple tests in for the same item, each has to have its own unique key!
:::
