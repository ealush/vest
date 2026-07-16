---
title: Conditional Form Sections
description: Distinguish temporarily skipped validation from fields that are irrelevant to the current workflow.
keywords: [conditional validation, optional form section, omitWhen, skipWhen]
---

# Conditional Form Sections

Conditional interfaces create two different states that should not be conflated:

- **Not ready to run:** the rule is still required, but a prerequisite currently fails.
- **Not applicable:** the field should not count toward validity at all.

Use `skipWhen` for the first case and `omitWhen` for the second.

```ts
import { create, enforce, omitWhen, skipWhen, test } from 'vest';

export const checkoutSuite = create(data => {
  test('email', 'Enter a valid email address', () => {
    enforce(data.email).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  skipWhen(
    result => result.hasErrors('email'),
    () => {
      test('email', 'This email already has an account', async () => {
        enforce(await isNewCustomer(data.email)).isTruthy();
      });
    },
  );

  omitWhen(!data.needsShipping, () => {
    test('street', 'Street is required', () => {
      enforce(data.street).isNotBlank();
    });
  });
});
```

When shipping is irrelevant, the omitted street test does not prevent the suite from becoming valid. When the email format is wrong, the remote email test is skipped but remains part of the eventual validity requirement.

## Keep work inside the test

`skipWhen` enters its callback so Vest can discover and preserve the skipped tests. Put network or other expensive work inside the `test` callback:

```ts
// Wrong: this work can start while the wrapper is discovering skipped tests.
skipWhen(true, () => {
  startExpensiveRequest();
});

// Correct: Vest skips the test body.
skipWhen(true, () => {
  test('email', 'Remote check failed', async () => {
    await startExpensiveRequest();
  });
});
```

`omitWhen`, by contrast, does not enter its callback when the condition is true because those tests do not belong to the current workflow at all.

## Decision rule

- Ask “will this rule matter later for the current workflow?” If yes, use `skipWhen`.
- Ask “does this field or section currently exist conceptually?” If no, use `omitWhen`.
- Use `optional(field)` when one value may be blank but must satisfy its tests when provided.

Prefer `optional(field)` when one field may be blank but must pass its rules when provided. Prefer `omitWhen` when an entire branch of the workflow becomes irrelevant.

Read the [`omitWhen` reference](../writing_your_suite/including_and_excluding/omitWhen.md) and [`skipWhen` reference](../writing_your_suite/including_and_excluding/skipWhen.md).
