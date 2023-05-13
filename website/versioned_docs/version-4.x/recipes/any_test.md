---
sidebar_position: 1
title: Recipe- "any" test - at least one must pass
description: A common scenario is to require at least one test to pass to consider the suite as passing.
keywords: [Recipe, any, test, at least, one, must, pass]
---

# "any" Test - At least one test must pass

A common scenario is to require at least one test to pass to consider the suite as passing. For example, you might require just one checkbox to be checked.

While "product-wise" you say "at-least-one", technically, there's nothing binding these checkboxes together. So, if there's nothing binding them technically, Vest can't be aware of that requirement without you telling it about it. Let's try to understand what it is that we're trying to do in "vest" terms.

In our case, the following logic should apply - Each of the checkboxes can be optional, if any of the other checkboxes is checked, or more specifically, since Vest has no notion of "checked" - Each of the checkboxes tests can be optional, if any of the other checkboxes tests are valid.

Vest has the [optional](./../writing_your_suite/optional_fields.md) function, which allows you to specify just that. You can specify a condition in which a test can be omitted from the results.

Our code might look somewhat like this:
[Live codesandbox](https://codesandbox.io/s/vest-5-any-test-optional-w1bwvm).

```js
import { create, test, enforce, only, optional } from 'vest';

const suite = create((data = {}, currentField) => {
  only(currentField);

  optional({
    chk_a: () => suite.get().isValid('chk_b') || suite.get().isValid('chk_c'),
    chk_b: () => suite.get().isValid('chk_a') || suite.get().isValid('chk_c'),
    chk_c: () => suite.get().isValid('chk_a') || suite.get().isValid('chk_b'),
  });

  // Alternatively, this is less verbose, but a duplicate of your test logic.
  // You can choose what's best for you.
  // optional({
  //   chk_a: () => data.chk_b || data.chk_c,
  //   chk_b: () => data.chk_a || data.chk_c,
  //   chk_c: () => data.chk_a || data.chk_b
  // });

  test('chk_a', () => {
    enforce(data.chk_a).isTruthy();
  });
  test('chk_b', () => {
    enforce(data.chk_b).isTruthy();
  });
  test('chk_c', () => {
    enforce(data.chk_c).isTruthy();
  });
});

export default suite;
```
