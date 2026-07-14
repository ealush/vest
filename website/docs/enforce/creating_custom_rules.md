---
sidebar_position: 4
title: Creating custom enforce rules
description: Sometimes we wish to create custom enforce rules. Here's how we can do this.
keywords: [Vest, custom, enforce, rule, creating, custom, rules]
---

# Creating Custom Rules

By default, enforce comes with a list of rules that are available to be used. They intentionally do not cover all the cases that can be encountered in a real-world application but instead focus on the most common use cases.

## Why Custom Rules?

Every application has unique domain logic. You might need to validate:

- A specific product SKU format.
- That a start date is before an end date.
- That a username exists in your database.

Custom rules allow you to extend Vest's vocabulary to speak your domain language.

Use `condition` for one-off logic. Use `enforce.extend` when a rule represents stable vocabulary that should be shared across suites or schemas.

## Inline logic with `condition`

Sometimes you would need to add some custom logic to your validation. For that you can use `enforce.condition` which accepts a function.

Your provided function will receive the enforced value and returns either a boolean or a rule-return object.

```js
// Passes if the value is `1`
enforce(1).condition(value => {
  return value === 1;
});
```

```js
enforce(2).condition(value => {
  return {
    pass: value === 1,
    message: 'value must be one',
  };
});
```

## Reusable custom rules with enforce.extend

To make it easier to reuse logic across your application, sometimes you would want to encapsulate bits of logic in rules that you can use later on, for example, "what's considered a valid email".

import CustomRulesSandpack from '@site/src/components/Sandpack/CustomRules';

Rules are called with the argument passed to enforce(x) followed by the arguments passed to `.yourRule(y, z)`.

<CustomRulesSandpack />

```js
enforce.extend({
  isValidEmail: value => value.indexOf('@') > -1,
  hasKey: (value, key) => value.hasOwnProperty(key),
  passwordsMatch: (passConfirm, options) =>
    passConfirm === options.passConfirm && options.passIsValid,
});

enforce(user.email).isValidEmail();
```

## Custom rules return value

Rules can return a boolean or a rule-result object. `pass` indicates success, and `message` may be a string or a function that returns the failure message.

```js
enforce.extend({
  isWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

## Context Aware Rules

Custom rules can access the validation context using `enforce.context()`. This is useful when validating schemas where a rule needs to know about other fields (e.g., "confirm password").

```javascript
import { enforce } from 'vest';

enforce.extend({
  matchesField: (value, fieldName) => {
    const context = enforce.context();
    const parent = context?.parent()?.value;
    return value === parent?.[fieldName];
  },
});

const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().matchesField('password'),
});
```

`parent` is a function in Vest 6 and context may be absent, so context-aware rules should use nullable access. Nested arrays or objects may require more than one `parent()` traversal.

## TypeScript Support

To ensure your custom rules are typed correctly in your IDE, you must extend the `n4s` namespace.

```typescript
// customRules.ts
import { enforce } from 'vest';

const customRules = {
  isValidEmail: (value: string) => value.includes('@'),
  isWithinRange: (value: number, min: number, max: number) =>
    value >= min && value <= max,
};

enforce.extend(customRules);

// Extend the interface to add types
declare global {
  namespace n4s {
    interface EnforceMatchers {
      isValidEmail: (value: string) => boolean;
      isWithinRange: (value: number, min: number, max: number) => boolean;
    }
  }
}
```

_Note: In the interface definition, include the `value` as the first argument._
