---
sidebar_position: 1
title: enforce
description: Enforce is Vest's assertion library. It is used to validate values within a Vest test.
keywords: [Vest, enforce, validation, validation library, assertions]
---

# Enforce

Enforce is Vest's assertion library. It is used to validate values within a Vest test.

```js
import { enforce, test } from 'vest';

test('username', 'Must be at least three characters long', () => {
  enforce(username).longerThan(2);
});
```
