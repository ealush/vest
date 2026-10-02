---
sidebar_position: 6
title: Handling User Interaction
description: How to show validation errors only when users interact with fields using isTested and suite.only()
keywords: [Vest, dirty, isDirty, isTested, validation, pristine, focus, onBlur]
---

# Handling User Interaction

A common challenge in form validation is "noise control." You don't want to scream errors at a user before they've even touched a field.

Traditionally, libraries use an `isDirty` flag to track if a user has modified a field. Since Vest is **UI-agnostic** (it doesn't touch your DOM or listen to events), it doesn't track "dirty" state for you.

Vest provides two tools for this: **`isTested()`** and **`suite.only()`**.

## 1. `isTested()`: The Vest Alternative to `isDirty`

When you want to decide _if_ you should show an error message, you usually want to know: "Has this field actually been validated yet?"

If a field hasn't been validated, it usually means the user hasn't interacted with it. Vest tracks this for you.

```javascript
const result = suite.get();

// Only show errors if the field has actually been tested
const shouldShowError =
  result.hasErrors('username') && result.isTested('username');

if (shouldShowError) {
  renderError(result.getErrors('username'));
}
```

This pattern ensures that empty, untouched fields don't show "Required" errors when the form first loads.

## 2. Validating on Interaction with `suite.only()`

When a user blurs a field or types, you often want to validate **only that specific field**, without affecting other fields.

`suite.only()` does exactly this — it tells Vest to run validations for a specific field, while preserving the results of everything else.

```javascript
// On Blur handler
function handleBlur(fieldName, formData) {
  // 1. Tell Vest to focus ONLY on the blurred field
  suite.only(fieldName).run(formData);
}
```

### Why use `suite.only()`?

- **Performance:** It skips expensive tests (like async checks) for fields the user isn't touching.
- **User Experience:** It updates the state for the current field without accidentally flagging other fields as "tested" or "invalid" before the user reaches them.

:::tip Real-World Pattern
Combine `suite.only()` with `isTested()` for the best UX:

- Use `suite.only(fieldName)` in your `onBlur` handler to validate only the current field
- Use `isTested(fieldName)` when rendering to decide whether to show errors
  :::

## Complete Example

```javascript
import suite from './validation';

function Form() {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(suite.get());

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = e => {
    const { name } = e.target;
    // Validate only the blurred field
    const res = suite.only(name).run(formData);
    setResult(res);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Validate all fields on submit
    const res = suite.run(formData);
    setResult(res);

    if (res.isValid()) {
      // Submit the form
    }
  };

  // Only show error if field was tested
  const showError = fieldName => {
    return result.isTested(fieldName) && result.hasErrors(fieldName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" onChange={handleChange} onBlur={handleBlur} />
      {showError('username') && <span>{result.getError('username')}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Summary

| Goal                         | Traditional Approach          | Vest Approach                        |
| :--------------------------- | :---------------------------- | :----------------------------------- |
| **Did the user touch this?** | Check `field.isDirty`         | Check `result.isTested('field')`     |
| **Validate on Blur**         | Call `validateField('field')` | Call `suite.only('field').run(data)` |

By combining `isTested()` (to hide premature errors) and `suite.only()` (to update specific fields), you get precise control over the user experience without tightly coupling your validation to the DOM.

## Related

- [Focused Updates](./focused_updates.md) - Deep dive into `suite.only()` and `suite.focus()`
- [Accessing the Result](./accessing_the_result.md) - Learn about `isTested()` and other result methods
