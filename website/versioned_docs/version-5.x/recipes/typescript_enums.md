---
title: Recipe- validating typescript enums
description: How to validate typescript enums
keywords: [Recipe, typescript, enums, inside, keys]
---

Sometimes you might want to validate that a value is one of the keys or values of a typescript enum. Since typescript enums are compiled to objects, you can use the `inside` function to validate that the value is one of the keys or values of the enum.

```ts
enum Fruits {
  APPLE = 'apple',
  BANANA = 'banana',
  CANTELOPE = 'cantelope',
}

// ...

// If you need the enum by key:
test('fruit', 'fruit is a key of fruits enum', () => {
  // data.fruit is a key of ["APPLE", "BANANA", "CANTELOPE"]
  enforce(data.fruit).inside(Object.keys(Fruits));
});

// If you need the enum by value:
test('fruit', 'fruit is a value of fruits enum', () => {
  // data.fruit is a value of ["apple", "banana", "cantelope"]
  enforce(data.fruit).inside(Object.values(Fruits));
});
```
