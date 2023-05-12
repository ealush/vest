---
sidebar_position: 13
title: Upgrade guides
description: Guides for upgrading Vest
keywords: [Vest, Upgrade]
---

# Upgrading from V4 to V5

### Installation

Vest@5 is currently in latest testing phase. To install it, use the `next` tag:

```bash
npm install vest@next
```

### Migration guide

Vest 5 is mostly compatible with Vest 4, but some changes were made. In most cases, if you do not change anything, vest will keep working as it did before. However, to take advantage of the new features, you'll need to make some changes.

## Eager execution mode is now the default

In previous versions of Vest, Vest continued validating fields even after one of their tests had failed. V5 changes that to improve the runtime performance, and instead, Vest will halt further validations of a given field if it failed. This was an opt-in feature, and it can now be removed. [Read more on execution modes](./writing_your_suite/execution_modes.md).

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

This also means that if you've used `skipWhen` to avoid running of failing fields, you can now remove it:

```diff
- import {create, test, skipWhen} from 'vest';
+ import {create, test} from 'vest';

const suite = create(() => {

- skipWhen(res => res.hasErrors('username'), () => {
    test('username', 'username already taken', () => {
      // ...
    });
- });
});
```

## All result methods are now available directly on the suite object

In previous versions, you had to call `suite.get()` to access the different methods, such as `getErrors` and `isValid`. In V5, these methods are available directly on the suite object. [Read more](./writing_your_suite/accessing_the_result.md).

```diff
- suite.get().getErrors('username');
+ suite.getErrors('username')

- suite.get().isValid();
+ suite.isValid()
```

## Added `hasError` and `hasWarning` methods

The result object has two new methods: hasError and hasWarning. They return a boolean value indicating whether a given field has an error or a warning. With these new methods, you can display the first error of a field. [Read more](./writing_your_suite/accessing_the_result.md).

```diff
- res.getErrors('username')[0]
+ res.hasError('username')
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

## Dropped support for <ES2015

Vest 5 uses Javascript Proxies, which were introduced in ES2015. Therefore, Vest 5 no longer supports pre-ES2015 versions of Javascript. If you need to support older browsers, you can still use Vest 4.
