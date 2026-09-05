---
sidebar_position: 4
title: Focused Updates
description: Run validation only for specific fields or skip groups using suite.focus()
keywords: [Vest, Focus, Only, Skip, SkipGroup, Validation]
---

# Focused Updates

Sometimes you want to run validation only for a specific field (e.g., on blur). Vest 6 introduces the `suite.focus()` method for declarative control over which fields to validate.

:::tip New in Vest 6
`suite.only()` and `suite.focus()` are the recommended ways to handle field-focused validation in Vest 6. They provide a cleaner API compared to using `only()` and `skip()` hooks inside your suite.
:::

## Why Focus?

In a large form, re-validating the entire suite on every keystroke can be inefficient and annoying for the user (e.g., showing errors for fields they haven't touched yet). Focused updates allow you to:

- **Validate on Blur**: Run checks only for the field the user just left.
- **Skip Expensive Tests**: Temporarily bypass heavy async validations when they aren't needed.
- **Skip Entire Groups**: Bypass whole sections of validation (e.g., skip "sign-up" validations when signing in).
- **Improve Performance**: Run only what's necessary.
- **Better UX**: Avoid showing errors for untouched fields.

## Basic Usage

### Running Only Specific Fields

The most common use case is validating a single field as the user types or leaves an input. You can use the `suite.only('fieldName')` shorthand to restrict the run to specific fields.

(For multiple fields, you can pass an array: `suite.only(['field1', 'field2'])`).

If you need to combine focusing with other modifiers (e.g. `only` + `skipGroup`), use `suite.focus({ ... })` instead.

import FocusedUpdatesSandpack from '@site/src/components/Sandpack/FocusedUpdates';

<FocusedUpdatesSandpack />

### Skipping Specific Fields

Use `focus({ skip: ... })` to exclude specific fields from the run while running everything else.

```javascript
// Skip the 'promoCode' field during this run
suite.focus({ skip: 'promoCode' }).run(formData);

// Skip multiple fields
suite.focus({ skip: ['promoCode', 'referralCode'] }).run(formData);
```

### Skipping Entire Groups

Use `focus({ skipGroup: ... })` to skip all tests inside a named group. Tests outside the group run normally.

### Running Only Entire Groups

Use `focus({ onlyGroup: ... })` to run _only_ tests inside a named group. Tests outside the group (including top-level tests) are skipped.

```javascript
// Run only tests declared inside group('signUp', ...)
suite.focus({ onlyGroup: 'signUp' }).run(formData);

// Run only tests inside multiple specified groups
suite.focus({ onlyGroup: ['signIn', 'signUp'] }).run(formData);
```

### `skip` vs `skipGroup`

Both modifiers exclude tests, but they target different scopes:

- `skip`: skips by **field name**, no matter where that field is declared.
- `skipGroup`: skips by **group name**, regardless of field names inside that group.

```javascript
// Skip every `email` test across the suite (top-level and inside groups)
suite.focus({ skip: 'email' }).run(formData);

// Skip only tests declared inside group('signUp', ...)
suite.focus({ skipGroup: 'signUp' }).run(formData);
```

```javascript
import { create, test, group, enforce } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  group('signIn', () => {
    test('password', 'Password is required', () => {
      enforce(data.password).isNotBlank();
    });
  });

  group('signUp', () => {
    test('email', 'Email is required', () => {
      enforce(data.email).isEmail();
    });
    test('tos', 'You must accept the terms', () => {
      enforce(data.tos).equals(true);
    });
  });
});

// When signing in, skip the signUp group entirely
suite.focus({ skipGroup: 'signUp' }).run(formData);

// When signing up, skip the signIn group entirely
suite.focus({ skipGroup: 'signIn' }).run(formData);

// Skip multiple groups at once
suite.focus({ skipGroup: ['signIn', 'signUp'] }).run(formData);
```

`skipGroup` works by injecting a `skip(true)` call at the beginning of each matching group's callback. Since `skip(true)` creates a transient isolate, it adds zero overhead to the stored suite state between runs.

### Combining Modifiers

You can combine `only`, `skip`, and `skipGroup` in a single `focus()` call:

```javascript
// Only validate 'username', and also skip the 'signUp' group
suite.focus({ only: 'username', skipGroup: 'signUp' }).run(formData);
```

### Focus Modifier Precedence

When multiple modifiers are used, they are evaluated in the following order of precedence (highest to lowest):

1. `skipGroup` (Destructive): Explicitly skipped groups are always skipped.
2. `onlyGroup` (Constructive): If present, restricts execution to specific groups. Top-level tests are excluded.
3. `skip` (Destructive): Explicitly skipped fields are skipped, even if they match an allowed group.
4. `only` (Constructive): If present, restricts execution to specific fields within the allowed groups.

> **Note**: A test is run only if it passes _all_ active filters. For example, if you use `onlyGroup: 'A'` and `skip: 'field1'`, `field1` inside `Group A` will be skipped.

### Dependency-Aware Focus with `suite.changed()`

`only()` runs exactly the fields you name — nothing more. When your suite has a schema with [`dependsOn()`](./schema_relationships) relationships, `suite.changed()` goes one step further: it runs the named fields **plus every field the relationship graph marks as affected**, so dependents never go stale:

```javascript
// Re-runs `password` and, via dependsOn, `confirmPassword` too.
suite.changed('password').run(formData);

// Arrays, chaining, and nested paths all work.
suite.changed(['password', 'country']).run(formData);
suite.changed('password').only('confirmPassword').run(formData);
suite.changed('travelers[1].passportCountry').run(formData);
```

Use `only()` for explicit execution selection and `changed()` for interaction-driven revalidation. See [Schema Relationships](./schema_relationships) for the full reference, including the affected-set rules and end-to-end examples.

## Fluent Chain API

`focus()` returns a "runnable" interface, allowing you to chain it with `afterEach`, `afterField`, or `run`.

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

### Multi-Step Form with Group Skipping

```javascript
const suite = create(data => {
  group('step1', () => {
    test('name', 'Name is required', () => {
      enforce(data.name).isNotBlank();
    });
  });

  group('step2', () => {
    test('address', 'Address is required', () => {
      enforce(data.address).isNotBlank();
    });
  });

  group('step3', () => {
    test('payment', 'Payment method is required', () => {
      enforce(data.payment).isNotBlank();
    });
  });
});

// Validate only step 2 by skipping the other steps
suite
  .focus({ skipGroup: ['step1', 'step3'] })
  .afterEach(() => setResult(suite.get()))
  .run(formData);
```

### Validating All Fields Without Focus

When you need to validate everything (e.g., on form submit), simply call `run()` without `focus()`:

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

## Focus Modifiers Reference

| Modifier    | Type                 | Description                                                                         |
| ----------- | -------------------- | ----------------------------------------------------------------------------------- |
| `only`      | `string \| string[]` | Run only the specified field(s). All others are excluded.                           |
| `skip`      | `string \| string[]` | Skip the specified field(s). All others run as usual.                               |
| `onlyGroup` | `string \| string[]` | Run only tests inside the named group(s); top-level (ungrouped) tests are excluded. |
| `skipGroup` | `string \| string[]` | Skip all tests inside the named group(s).                                           |

## Comparison: `suite.focus()` vs `only()`/`skip()`

| Feature                    | `only()`/`skip()`              | `suite.focus()`                        |
| -------------------------- | ------------------------------ | -------------------------------------- |
| **Location**               | Inside suite callback          | Outside, at call site                  |
| **Flexibility**            | Requires conditional logic     | Fully dynamic                          |
| **Separation of Concerns** | Mixed with validation          | Decoupled from validation              |
| **Group Skipping**         | `skip(true)` inside group      | `skipGroup` modifier                   |
| **Chainable**              | No                             | Yes (`afterEach`, `afterField`, `run`) |
| **Best For**               | Static, logic-based exclusions | UI-driven field focus                  |

### When to Use Each

**Use `suite.focus()`** when:

- Validating on blur or focus events
- The decision of what to validate comes from UI interactions
- You want to skip entire groups from outside the suite
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
- **skipGroup is transient**: The `skip(true)` isolate injected by `skipGroup` is transient — it is not stored in the suite state tree and adds zero overhead between runs.
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
suite.only('username').run(formData); // ✅
suite.only('nonexistent').run(formData); // ❌ Type error
suite.focus({ skip: 'email' }).run(formData); // ✅
suite.focus({ skipGroup: 'myGroup' }).run(formData); // ✅
suite.focus({ skipGroup: ['groupA', 'groupB'] }).run(formData); // ✅
suite.focus({ onlyGroup: 'groupA' }).run(formData); // ✅
```

## Related

- [Schema Relationships](./schema_relationships) - Dependency-aware revalidation with `suite.changed()` and `dependsOn()`
- [Including and Excluding Fields](./including_and_excluding/skip_and_only) - Using `only()` and `skip()` inside suites
- [Include](./including_and_excluding/include) - Link related fields to run together
- [Test Groups](../writing_tests/advanced_test_features/grouping_tests) - Grouping tests together
- [`focus({ skip / skipGroup / onlyGroup })` Patterns](../recipes/focus_skipgroup_recipes) - Practical recipes for choosing and combining focus modifiers
