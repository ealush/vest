---
sidebar_position: 10
title: Understanding Vest's State
description: Learn how Vest's stateful validation works and why it makes form validation faster and more accurate.
keywords: [Vest, Stateful Validations, Field merge, Resetting, Removing fields]
---

# Understanding Vest's State

Vest suites keep validation state between runs. A focused run updates the fields it checked and leaves the other field results in place.

## Why Stateful Validation?

Imagine a form with 10 fields. When a user updates just the "username" field, you have two options:

1. **Re-validate everything** - Slow, and might flash errors on untouched fields
2. **Validate only "username"** - Fast, but you lose the state of other fields

With Vest, you can validate one field and keep the rest of the result.

### How It Works

```
Step 1: User fills "Password" field
        └─→ suite.run() validates password
        └─→ Result: { password: ✓ }

Step 2: User fills "Username" field
        └─→ suite.only('username').run()
        └─→ Vest runs ONLY username tests
        └─→ Vest MERGES with previous password result
        └─→ Result: { username: ?, password: ✓ }  ← Full picture!

Step 3: User fixes username error
        └─→ suite.only('username').run()
        └─→ Result: { username: ✓, password: ✓ }  ← Ready to submit!
```

This is why `isValid()` always gives you the complete answer - even when you only validated one field.

## What Vest's State Does

- **Skipped field merge**: When you focus on specific fields, Vest keeps the results of untouched fields.
- **Lagging async test blocking**: If an old async test finishes after a new one started, Vest ignores the stale result.

## When State Becomes a Problem

Stateful validation is great for forms, but sometimes you need to reset it.

### Problem 1: Navigation in SPAs

If a user submits a form successfully, navigates away, then comes back - the form still shows "success" state from the previous submission.

**Solution: Reset on mount**

```javascript
useEffect(() => {
  suite.reset();
}, []);
```

### Problem 2: Dynamic Fields

If you dynamically add/remove fields (like items in a cart), removed fields still exist in Vest's state and might cause `isValid()` to return `false`.

**Solution: Remove the field**

```javascript
function handleRemoveItem(id) {
  removeFromCart(id);
  suite.remove(`item_${id}`);
}
```

## State Management Methods

### `suite.reset()`

Wipes all validation state. Use when:

- User clicks "Clear form"
- Component unmounts
- Starting a new transaction

```javascript
suite.reset();
```

### `suite.resetField(fieldName)`

Clears just one field's results. Use when:

- User clicks "clear" on an input
- You want to remove errors without re-validating

```javascript
suite.resetField('email');
```

### `suite.remove(fieldName)`

Removes a field from state entirely. Use when:

- A field is dynamically removed from the UI
- You want `isValid()` to stop considering that field

```javascript
suite.remove('couponCode');
```

## Stateless Alternative: `runStatic()`

If you're on the server or don't need state merging, use `runStatic()`:

```javascript
// Server-side: fresh validation every request
app.post('/register', (req, res) => {
  const result = suite.runStatic(req.body);
  // State is immediately discarded
});
```

## Summary

| Scenario                | Solution                    |
| ----------------------- | --------------------------- |
| Form reset / navigation | `suite.reset()`             |
| Clear single field      | `suite.resetField('field')` |
| Remove dynamic field    | `suite.remove('field')`     |
| Server-side validation  | `suite.runStatic()`         |

Vest's statefulness is a feature, not a limitation. It's what makes incremental validation fast and accurate. When you need to escape it, the tools above give you full control.
