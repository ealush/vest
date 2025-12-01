---
sidebar_position: 4
title: Focused Updates
description: Run validation only for specific fields or skip certain fields.
keywords: [Vest, Focus, Only, Skip, Validation]
---

# Focused Updates

Sometimes you want to run validation only for a specific field (e.g., on blur) or skip certain fields. Vest introduces the `suite.focus()` method for declarative control over execution flow.

## Why Focus?

In a large form, re-validating the entire suite on every keystroke can be inefficient and annoying for the user (e.g., showing errors for fields they haven't touched yet). Focused updates allow you to:

- **Validate on Blur**: Run checks only for the field the user just left.
- **Skip Expensive Tests**: Temporarily bypass heavy async validations when they aren't needed.
- **Improve Performance**: Run only what's necessary.

## Running Only Specific Fields

Use `focus({ only: ... })` to restrict the run to specific fields.

```javascript
// Run only the 'username' field tests
suite.focus({ only: 'username' }).run(formData);

// Run multiple fields
suite.focus({ only: ['username', 'password'] }).run(formData);
```

This is equivalent to using the `only()` hook inside the suite, but defined externally at runtime.

## Skipping Fields

Use `focus({ skip: ... })` to ignore specific fields.

```javascript
// Run everything EXCEPT 'terms_of_service'
suite.focus({ skip: 'terms_of_service' }).run(formData);
```

## Fluent Chain

`focus` returns a "runnable" interface, allowing you to chain it with `after` or `run`.

```javascript
suite
  .focus({ only: 'email' })
  .after(res => updateUI(res))
  .run(formData);
```

:::caution Behavior notes

- Focused runs do not persist between calls. Each `focus` call applies only to the immediately following run.
- When focusing specific fields, schema validation is skipped for fields outside the focus scope, allowing targeted validation even if the full payload is invalid.
  :::
