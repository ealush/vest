---
title: Validate One Field or Step
description: Validate the field or step that changed without losing earlier results.
keywords: [focused validation, field validation, progressive form, Vest only]
---

# Validate One Field or Step

Running every rule after each keystroke wastes work and can show errors for fields the user has not touched. With Vest, the UI says what changed and the suite keeps the other results.

```ts
const result = signupSuite.only('email').run(formData);
```

Only tests named `email` execute. Passing or failing results for fields such as `username` and `password` remain available.

## The result still contains the other fields

```ts
const data = {
  bio: 'TypeScript developer',
  password: 'short',
  username: 'al',
};

let result = profileSuite.only('username').run(data);
result.hasErrors('username'); // true
result.isTested('password'); // false

result = profileSuite.only('password').run(data);
result.hasErrors('password'); // true
result.hasErrors('username'); // still true

data.username = 'alice';
result = profileSuite.only('username').run(data);
result.isValid('username'); // true
result.hasErrors('password'); // still true
```

The second run does not replace the result with a password-only object. Vest reconciles the new password tests with the username result already stored by the suite.

```ts
function validateField(field, nextValues) {
  const result = signupSuite.only(field).run(nextValues);

  return {
    errors: result.getErrors(field),
    pending: result.isPending(field),
    tested: result.isTested(field),
  };
}
```

For several fields or a workflow step, use `focus`:

```ts
signupSuite.focus({ only: ['country', 'city', 'postalCode'] }).run(formData);

signupSuite.focus({ onlyGroup: 'shipping' }).run(formData);
```

Focus belongs at the interaction call site because the UI knows what changed. Business-driven inclusion—such as a dependent field—belongs inside the suite.

## Full validation still matters

Before progressing through a guarded step, run the step group and await it. Before final submission, run the whole suite:

```ts
const step = await signupSuite.focus({ onlyGroup: 'shipping' }).run(formData);

if (step.isValidByGroup('shipping')) {
  goToNextStep();
}

const complete = await signupSuite.run(formData);
```

Focused validation changes what runs now. It does not redefine the complete validity requirements.

## Common mistakes

| Mistake                                                     | Correction                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Passing only the focused field when rules read other values | Pass the current complete form object                                            |
| Using `focus({ omit: field })`                              | The call-site modifier is `skip`; `omitWhen` has different suite semantics       |
| Checking global `isValid()` before required fields have run | Use field or group selectors during progression and run the full suite on submit |
| Putting UI event focus inside the suite callback            | Let the interaction choose `suite.only()` or `suite.focus()`                     |

Try adding a display name that depends on username, then focus both fields when either value changes.

Read the [focus modifier reference](../writing_your_suite/focused_updates.md).
