---
sidebar_position: 2
title: Dynamic Tests & Arrays
description: Learn how to iterate over data to create dynamic validation rules using the 'each' helper.
keywords: [Vest, each, dynamic tests, array validation, loops]
---

# Dynamic Tests with `each`

Forms often have dynamic lists: a list of travelers, a set of product attributes, or multiple shipping addresses. You don't know how many fields you'll have until runtime.

Vest provides the `each` helper to handle these lists efficiently.

## Using `each`

Think of `each` as a smarter `forEach` loop designed specifically for validation. It takes two arguments:

1. The array to iterate over.
2. A callback function to run for every item.

The key for tracking goes on each `test` call as the last argument.

```javascript
import { create, test, each, enforce } from 'vest';

const suite = create(data => {
  // data.products is an array of objects
  each(data.products, product => {
    test(
      'product_name',
      'Name is required',
      () => {
        enforce(product.name).isNotBlank();
      },
      product.id,
    ); // <--- The key goes on the test

    test(
      'product_price',
      'Price must be positive',
      () => {
        enforce(product.price).greaterThan(0);
      },
      product.id,
    );
  });
});
```

## Why do I need a Key?

You know how React warns you if you render a list without a `key` prop? Vest needs keys for the same reason.

Vest is stateful. It remembers that the test for "Product A" failed. If you reorder the list or delete "Product A", Vest needs to know that the tests associated with "Product A" should move or disappear, rather than attaching the old error to the new item in that index.

### How to specify the Key

The key is the last argument to `test`. It can be any string or number that uniquely identifies the item:

```javascript
each(data.items, item => {
  test(
    'item_name',
    'Name required',
    () => {
      enforce(item.name).isNotBlank();
    },
    item.id,
  ); // Uses item.id as the key
});
```

You can also use a computed key:

```javascript
each(data.items, item => {
  test(
    'item_name',
    'Name required',
    () => {
      enforce(item.name).isNotBlank();
    },
    `${item.type}_${item.id}`,
  );
});
```

:::danger Avoid using Index
Never use the array index as a key (or omit the key argument, which defaults to index). If the user deletes the first item, the second item will inherit the first item's validation state (and errors!), leading to a confusing UI.
:::
