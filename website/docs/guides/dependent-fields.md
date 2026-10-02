---
title: Dependent and Cross-Field Validation
description: Revalidate linked fields when one value changes without rerunning the rest of the workflow.
keywords:
  [cross-field validation, dependent fields, confirm password, date range]
---

# Dependent and Cross-Field Validation

A focused run needs one extra rule when fields depend on each other: changing one value must invalidate conclusions derived from it.

Use `include(...).when(...)` to express that relationship inside the suite:

```ts
import { create, enforce, include, test } from 'vest';

export const passwordSuite = create(data => {
  include('confirmPassword').when('password');

  test('password', 'Password must contain at least 10 characters', () => {
    enforce(data.password).longerThanOrEquals(10);
  });

  test('confirmPassword', 'Passwords do not match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });
});
```

Now this call validates both the changed password and its dependent confirmation:

```ts
passwordSuite.only('password').run(formData);
```

The same pattern works for start/end dates, country/postal-code rules, minimum/maximum values, and coupled configuration options.

## Avoid premature errors

Only include an untouched dependent field when it has a value or was already tested:

```ts
include('confirmPassword').when(result => {
  return Boolean(data.confirmPassword) || result.isTested('confirmPassword');
});
```

This preserves dependency correctness without showing an error before the user reaches the confirmation field.

Keep the dependency next to the rules it affects. Repeating this logic in component event handlers makes it easy for different screens to validate the same data differently.

Read the complete [`include` reference](../writing_your_suite/including_and_excluding/include.md).
