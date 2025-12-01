---
sidebar_position: 6
title: Enforce Rules Composition
description: When you have rules that you often use together or different groups of rules that describe the same behavior, you can compose them into a single rule for easier reuse.
keywords: [Vest, enforce, rules, composition, shape, loose, schema, compose]
---

# Composing Enforce Rules

You can combine multiple enforce rules into a single reusable validator using `compose`.

## Why Compose?

Sometimes you have a set of rules that always go together. For example, a "valid age" might always need to be:

1.  A number
2.  At least 18
3.  Less than 120

Instead of repeating these three checks every time, you can compose them into a single `isValidAge` rule. This promotes reuse and keeps your schemas clean.

```javascript
import { enforce, compose } from 'vest';

const isValidAge = compose(
  enforce.isNumber(),
  enforce.greaterThanOrEquals(18),
  enforce.lessThan(120),
);

// Usage
isValidAge.run(20); // { pass: true }
isValidAge.run(15); // { pass: false }

// Inside a schema
const userSchema = enforce.shape({
  age: isValidAge,
});
```

Composed rules act just like standard enforce rules and can be used for type guards, schema validation, or standalone assertions.
