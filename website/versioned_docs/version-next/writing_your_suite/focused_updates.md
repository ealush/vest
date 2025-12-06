---
sidebar_position: 4
title: Focused Updates
description: Run validation only for specific fields using suite.focus()
keywords: [Vest, Focus, Only, Validation]
---

# Focused Updates

Sometimes you want to run validation only for a specific field (e.g., on blur). Vest 6 introduces the `suite.focus()` method for declarative control over which fields to validate.

:::tip New in Vest 6
`suite.focus()` is the recommended way to handle field-focused validation in Vest 6. It provides a cleaner API compared to using `only()` and `skip()` hooks inside your suite.
:::

## Why Focus?

In a large form, re-validating the entire suite on every keystroke can be inefficient and annoying for the user (e.g., showing errors for fields they haven't touched yet). Focused updates allow you to:

- **Validate on Blur**: Run checks only for the field the user just left.
- **Skip Expensive Tests**: Temporarily bypass heavy async validations when they aren't needed.
- **Improve Performance**: Run only what's necessary.
- **Better UX**: Avoid showing errors for untouched fields.

## Basic Usage

### Running Only Specific Fields

Use `focus({ only: ... })` to restrict the run to specific fields.

```javascript
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
  test('email', 'Email is required', () => {
    enforce(data.email).isEmail();
  });
  test('password', 'Password must be 8+ characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});

// Run only the 'username' field tests
suite.focus({ only: 'username' }).run(formData);

// Run multiple fields
suite.focus({ only: ['username', 'password'] }).run(formData);
```

## Fluent Chain API

`focus()` returns a "runnable" interface, allowing you to chain it with `afterEach`, `afterField`, or `run`.

```javascript
suite
  .focus({ only: 'email' })
  .afterEach(result => updateUI(result))
  .run(formData);

// Or with afterField for specific field callbacks
suite
  .focus({ only: ['email', 'password'] })
  .afterField('email', result => validateEmailUI(result))
  .afterField('password', result => validatePasswordUI(result))
  .run(formData);
```

## Real-World Examples

### Form Field Validation on Blur

```javascript
// In your form component
function handleBlur(fieldName, formData) {
  suite
    .focus({ only: fieldName })
    .afterEach(result => setValidationResult(result))
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

When you need to validate everything (e.g., on form submit), simply call `run()` without `focus()`:

```javascript
// Validate all fields on submit
function handleSubmit(formData) {
  suite.afterEach(setResult).run(formData);
}

// Or for focused blur validation
function handleBlur(fieldName, value) {
  suite
    .focus({ only: fieldName })
    .afterEach(setResult)
    .run({ ...formData, [fieldName]: value });
}
```

### React Hook Integration

```jsx
import { useState, useCallback } from 'react';
import { create, test, enforce } from 'vest';

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
      suite.focus({ only: fieldName }).afterEach(setResult).run(formData);
    },
    [formData],
  );

  const validateAll = useCallback(() => {
    suite.afterEach(setResult).run(formData);
  }, [formData]);

  return { formData, setFormData, result, validateField, validateAll };
}
```

## Comparison: `suite.focus()` vs `only()`/`skip()`

| Feature                    | `only()`/`skip()`              | `suite.focus()`                        |
| -------------------------- | ------------------------------ | -------------------------------------- |
| **Location**               | Inside suite callback          | Outside, at call site                  |
| **Flexibility**            | Requires conditional logic     | Fully dynamic                          |
| **Separation of Concerns** | Mixed with validation          | Decoupled from validation              |
| **Chainable**              | No                             | Yes (`afterEach`, `afterField`, `run`) |
| **Best For**               | Static, logic-based exclusions | UI-driven field focus                  |

### When to Use Each

**Use `suite.focus()`** when:

- Validating on blur or focus events
- The decision of what to validate comes from UI interactions
- You want to chain callbacks

**Use `only()`/`skip()`** when:

- The exclusion logic depends on the data itself
- You have static, predetermined exclusions
- The logic belongs inside the suite

## Behavior Notes

:::caution Important

- **Non-persistent**: Focused runs do not persist between calls. Each `focus` call applies only to the immediately following `run()`.
- **Schema Validation**: When focusing specific fields, schema validation is skipped for fields outside the focus scope, allowing targeted validation even if the full payload is invalid.
- **State Preservation**: Previous validation results for non-focused fields are preserved.
  :::

## TypeScript Support

`suite.focus()` is fully typed. The field names are inferred from your suite definition:

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
suite.focus({ only: 'username' }).run(formData); // ✅
suite.focus({ only: 'nonexistent' }).run(formData); // ❌ Type error
```

## Related

- [Including and Excluding Fields](./including_and_excluding/skip_and_only) - Using `only()` and `skip()` inside suites
- [Include](./including_and_excluding/include) - Link related fields to run together
