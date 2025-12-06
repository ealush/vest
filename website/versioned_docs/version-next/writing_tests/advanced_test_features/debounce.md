---
sidebar_position: 4
title: Debouncing Tests
description: Debouncing tests to improve async test performance and flow control
keywords: [Vest, debounce, async, test]
---

## `debounce()`

The `debounce()` function in Vest helps you optimize function execution by introducing a delay. This is useful in scenarios where a function is called repeatedly due to user interaction, and you only want to execute the latest version after a period of inactivity.

### Usage

**1. Import Debounce**

```js
import debounce from 'vest/debounce';
```

**2. Wrap your Test Callback:**

```js
test(
  'username',
  'User already taken',
  debounce(async () => {
    await doesUserExist();
  }, 2000),
);
```

In the above example, Vest will wait for two seconds before executing the test, and it will be run only once, no matter how many times the suite was invoked during this time period.

:::caution IMPORTANT
When using `debounce`, all debounced tests are treated as async, even if the test callback is synchronous. This is because the test will be executed after the debounce period, which is an async operation.
:::
