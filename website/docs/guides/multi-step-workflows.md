---
title: Validation for Multi-Step Forms
description: Validate one step at a time and check the complete form before submission.
keywords:
  [multi-step form validation, wizard validation, onboarding, Vest groups]
---

# Validation for Multi-Step Forms

A multi-step form should validate the current step without forgetting the steps already completed. Submission still needs to check the whole form.

Model steps with groups:

```ts
import { create, enforce, group, test } from 'vest';

type Step = 'account' | 'profile' | 'billing';

type OnboardingData = {
  displayName: string;
  email: string;
  plan: string;
};

export const onboardingSuite = create<{
  fields: keyof OnboardingData;
  groups: Step;
}>((data: OnboardingData) => {
  group('account', () => {
    test('email', 'Email is required', () => {
      enforce(data.email).isNotBlank();
    });
  });

  group('profile', () => {
    test('displayName', 'Display name is required', () => {
      enforce(data.displayName).isNotBlank();
    });
  });

  group('billing', () => {
    test('plan', 'Choose a plan', () => {
      enforce(data.plan).isNotBlank();
    });
  });
});
```

The explicit config types are optional, but they make field and group names discoverable and reject misspelled step names in TypeScript.

Guard the next-step action with a focused, awaited run:

```ts
async function canContinue(step: Step, data: OnboardingData) {
  const result = await onboardingSuite.focus({ onlyGroup: step }).run(data);

  return result.isValidByGroup(step);
}
```

Earlier step results remain in the suite, so a review screen can show the whole form without repeating every remote check.

Cross-field rules remain ordinary TypeScript. Put password and confirmation tests in the same group, then run that group when either value changes. If a field outside the active group must also rerun, use the dependent-field patterns described in [dependent and cross-field validation](./dependent-fields.md).

## Final submission

```ts
const result = await onboardingSuite.run(data);

if (!result.isValid()) {
  navigateToFirstInvalidStep(result);
  return;
}
```

Do not equate “current step has no errors” with “complete workflow is valid.” Use group selectors for step navigation and whole-suite selectors for submission.

`onlyGroup` excludes ungrouped top-level tests. Put step requirements inside their groups or run deliberate top-level checks separately.

Read more about [grouping tests](../writing_tests/advanced_test_features/grouping_tests.md).
