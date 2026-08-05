import { FormApi } from '@tanstack/react-form';

import { createRegistrationIntegration } from './suite';
import type { RegistrationInput } from './suite';

export function createRegistrationForm(
  defaultValues: RegistrationInput,
  onSubmit: (value: RegistrationInput) => void | Promise<void> = () => {},
) {
  const integration = createRegistrationIntegration();

  return new FormApi({
    defaultValues,
    onSubmit: ({ value }) => onSubmit(value),
    validators: {
      onChange: integration.suite,
      onSubmit: integration.suite,
    },
  });
}
