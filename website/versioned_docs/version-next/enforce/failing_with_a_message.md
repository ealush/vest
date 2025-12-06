---
sidebar_position: 7
title: Failing with a message
description: Sometimes we wish to fail with a message based on the validation result. Here's how we can do this.
keywords: [Vest, custom, message, failing, with, message]
---

# Failing with a message

When running enforce you can specify a custom failure message to be thrown on failure. This is done via the `message` modifier. All you need to do is add the message before the rules it refers to.

If a message is provided, it will override the default message of all rules that follow it.

```js
enforce(value)
  .message('Value must be a number')
  .isNumber();
  .message('Value must be positive')
  .isPositive();
```
