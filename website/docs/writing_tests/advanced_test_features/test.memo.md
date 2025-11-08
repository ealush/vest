---
sidebar_position: 1
title: Memoizing test results
description: Vest supports memoization out of the box, and it can be used for async tests as well.
keywords: [Vest, Memoizing, test, results]
---

## test.memo for memoized tests

In order to improve performance and runtime in heavy or long-running tests (such as async tests that go to the server), tests individual test results can be cached and saved for a later time, so whenever the exact same params appear again in the same runtime, the test result will be used from cache, instead of having to be re-evaluated.

For brevity and simplicity, Vest adds a few implicit dependencies to the test.memo function. Vest uses the following dependencies along with yours:

1. The current suite instance id.
2. The current field name.
3. The Current test position within the suite.

### Usage:

Memoized tests are almost identical to regular tests, only with the added dependency array as the last argument. The dependency array is an array of items, that when identical (strict equality, `===`) to a previously presented array in the same test, its previous result will be used. You can see it as your cache key to the test result.

### Example:

```js
import { vest, test } from 'vest';
export default create(data => {
  test.memo(
    'username',
    'username already exists',
    () => doesUserExist(data.username),
    [data.username],
  );
});
```
