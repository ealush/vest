import { FormApi } from '@tanstack/react-form';

import { registrationSuite } from './suite';
import type { RegistrationInput } from './suite';

export function createRegistrationForm(
  defaultValues: RegistrationInput,
  onSubmit: (value: RegistrationInput) => void | Promise<void> = () => {},
) {
  return new FormApi({
    defaultValues,
    onSubmit: ({ value }) => onSubmit(value),
    validators: { onChange: registrationSuite, onSubmit: registrationSuite },
  });
}
