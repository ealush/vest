---
sidebar_position: 1
title: Memoizing Tests
description: Memoize parts of your suite to prevent re-running expensive logic.
keywords: [Vest, Memo, Cache, Performance]
---

# Memoizing Tests

Vest introduces a new, top-level `memo` function. It allows you to cache parts of your suite execution based on dependencies, preventing unnecessary re-runs of expensive logic or async tests.

## Why Memoize?

Validation suites often contain expensive operations, such as:

- **Async checks**: Checking if a username is taken (network request).
- **Heavy computations**: Validating complex data structures.

If the relevant data hasn't changed (e.g., the user is typing in the "password" field, but the "username" field hasn't changed), re-running the username check is wasteful. Memoization lets you skip these tests and reuse the previous result.

Unlike the previous `test.memo` which was limited to single tests, the new `memo` can wrap **any** part of your suite—single tests, multiple tests, groups, or arbitrary logic.

## Usage

Import `memo` from `vest`:

```javascript
import { create, test, memo } from 'vest';

const suite = create(data => {
  // cacheKey: [data.username]
  // If data.username hasn't changed since the last run,
  // this block is skipped, and previous results are restored.
  memo(() => {
    test('username', 'Username is taken', async () => {
      await checkAvailability(data.username);
    });
  }, [data.username]);
});
```

## Memoizing Groups

You can use `memo` to skip entire groups of tests if their relevant data hasn't changed.

```javascript
memo(() => {
  group('shipping_address', () => {
    test('street', 'Required', () => {
      /* ... */
    });
    test('city', 'Required', () => {
      /* ... */
    });
  });
}, [data.shipping_address]);
```

## How it works

1.  Vest checks the dependency array passed as the second argument.
2.  If the dependencies match the previous run, the callback function is **not executed**.
3.  Instead, Vest restores the test results (pass/fail/warn) produced by that block in the previous run.
