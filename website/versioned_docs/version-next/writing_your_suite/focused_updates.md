---
sidebar_position: 4
title: Focused Updates
description: Run validation only for specific fields using suite.only()
keywords: [Vest, Focus, Only, Validation]
---

# Focused Updates

Sometimes you want to run validation only for a specific field (e.g., on blur). Vest 6 introduces the `suite.only()` method for declarative control over which fields to validate.

:::tip New in Vest 6
`suite.only()` is the recommended way to handle field-focused validation in Vest 6. It provides a cleaner API compared to using `only()` and `skip()` hooks inside your suite.
:::

## Why Focus?

In a large form, re-validating the entire suite on every keystroke can be inefficient and annoying for the user (e.g., showing errors for fields they haven't touched yet). Focused updates allow you to:

- **Validate on Blur**: Run checks only for the field the user just left.
- **Skip Expensive Tests**: Temporarily bypass heavy async validations when they aren't needed.
- **Improve Performance**: Run only what's necessary.
- **Better UX**: Avoid showing errors for untouched fields.

## Basic Usage

### Running Only Specific Fields

Use `only(...)` to restrict the run to specific fields, or pass a `groups` list to focus by group name.

import FocusedUpdatesSandpack from '@site/src/components/Sandpack/FocusedUpdates';

<FocusedUpdatesSandpack />

## Fluent Chain API

`only()` returns a "runnable" interface, allowing you to chain it with `afterEach`, `afterField`, or `run`.

```javascript
suite
  .only('email')
  .afterEach(() => updateUI(suite.get()))
  .run(formData);

// Or with afterField for specific field callbacks
suite
  .only(['email', 'password'])
  .afterField('email', () => validateEmailUI(suite.get()))
  .afterField('password', () => validatePasswordUI(suite.get()))
  .run(formData);

// Focus by group
suite.only({ groups: 'billing' }).run(formData);
```

## Real-World Examples

### Form Field Validation on Blur

```javascript
// In your form component
function handleBlur(fieldName, formData) {
  suite
    .only(fieldName)
    .afterEach(() => setValidationResult(suite.get()))
    .run(formData);
}

// Usage in React
<input
  name="email"
  onBlur={() => handleBlur('email', formData)}
  onChange={handleChange}
/>;
```

### Validating All Fields Without Focus

When you need to validate everything (e.g., on form submit), simply call `run()` without `only()`:

```javascript
// Validate all fields on submit
function handleSubmit(formData) {
  suite.afterEach(() => setResult(suite.get())).run(formData);
}

// Or for focused blur validation
function handleBlur(fieldName, value) {
  suite
    .only(fieldName)
    .afterEach(() => setResult(suite.get()))
    .run({ ...formData, [fieldName]: value });
}
```

### React Hook Integration

```jsx
import { useState, useCallback } from 'react';
import { create, test, enforce } from 'vest';
import 'vest/email';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
  test('email', 'Email must be valid', () => {
    enforce(data.email).isEmail();
  });
});

function useFormValidation(initialData) {
  const [formData, setFormData] = useState(initialData);
  const [result, setResult] = useState(suite.get());

  const validateField = useCallback(
    fieldName => {
      suite
        .only(fieldName)
        .afterEach(() => setResult(suite.get()))
        .run(formData);
    },
    [formData],
  );

  const validateAll = useCallback(() => {
    suite.afterEach(() => setResult(suite.get())).run(formData);
  }, [formData]);

  return { formData, setFormData, result, validateField, validateAll };
}
```

## Comparison: `suite.only()` vs `only()`/`skip()`

| Feature                    | `only()`/`skip()`              | `suite.only()`                         |
| -------------------------- | ------------------------------ | -------------------------------------- |
| **Location**               | Inside suite callback          | Outside, at call site                  |
| **Flexibility**            | Requires conditional logic     | Fully dynamic                          |
| **Separation of Concerns** | Mixed with validation          | Decoupled from validation              |
| **Chainable**              | No                             | Yes (`afterEach`, `afterField`, `run`) |
| **Best For**               | Static, logic-based exclusions | UI-driven field focus                  |

### When to Use Each

**Use `suite.only()`** when:

- Validating on blur or focus events
- The decision of what to validate comes from UI interactions
- You want to chain callbacks

**Use `only()`/`skip()`** when:

- The exclusion logic depends on the data itself
- You have static, predetermined exclusions
- The logic belongs inside the suite

## Behavior Notes

:::caution Important

- **Non-persistent**: Focused runs do not persist between calls. Each `only` call applies only to the immediately following `run()`.
- **Schema Validation**: When focusing specific fields, schema validation is skipped for fields outside the focus scope, allowing targeted validation even if the full payload is invalid.
- **State Preservation**: Previous validation results for non-focused fields are preserved.
  :::

## TypeScript Support

`suite.only()` is fully typed. The field names are inferred from your suite definition:

```typescript
interface FormData {
  username: string;
  email: string;
  password: string;
}

const suite = create((data: FormData) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
  // ...
});

// TypeScript will autocomplete field names
suite.only('username').run(formData); // ✅
suite.only('nonexistent').run(formData); // ❌ Type error
```

## Related

- [Including and Excluding Fields](./including_and_excluding/skip_and_only) - Using `only()` and `skip()` inside suites
- [Include](./including_and_excluding/include) - Link related fields to run together
