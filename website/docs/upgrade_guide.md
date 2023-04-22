---
sidebar_position: 13
title: Upgrade guides
description: Guides for upgrading Vest
keywords: [Vest, Upgrade]
---

# Upgrading from V4 to V5

Vest 5 is mostly compatible with Vest 4, but some of the defaults were switched:

## Eager execution mode is now the default

In previous versions of Vest, Vest continued validating fields even after one of their tests had failed. V5 changes that to improve the runtime performance, and instead, Vest will halt further validations of a given field if it failed. This was an opt-in feature, and it can now be removed. [Read more on execution modes](./writing_your_suite/execution_modes.md)/

```diff
- import {create, test, eager} from 'vest';
+ import {create, test} from 'vest';

const suite = create(() => {
- eager();

  test(/*...*/);
});
```

To bring back the previous behavior, use the `mode` function that alters the execution mode:

```diff
- import {create, test} from 'vest';
+ import {create, test, mode, Modes} from 'vest';

const suite = create(() => {
+ eager(Modes.ALL);

  test(/*...*/);
});
```

## Server side validations are built-in

In previous versions, as a user of Vest you had to set up your own state-reset mechanism. Vest now has a `staticSuite` export that does that for you. [Read more on Server Side Validations](./server_side_validations.md).

```diff
- import {create} from 'vest';
+ import {staticSuite} from 'vest';

- const suite = create(() => {/*...*/});
+ const suite = staticSuite(() => /*...*/});

- function ServerValidation() {
-  suite.reset();
-  suite();
- }
```

## First-Class-Citizen typescript support

All of Vest's methods are now typed and make use of generics to enforce correct usage throughout your suite. [Read More on TypeScript support](./typescript_support.md).
