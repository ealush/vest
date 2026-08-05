import { expect, expectTypeOf, it } from 'vitest';

import { createRegistrationForm } from './integration';
import type { RegistrationInput } from './suite';

it('preserves the form input type', () => {
  const form = createRegistrationForm({
    email: 'dev@example.com',
    profile: { name: 'Ada' },
  });

  expect(form.state.values.email).toBe('dev@example.com');
  expectTypeOf(form.state.values).toEqualTypeOf<RegistrationInput>();
  form.setFieldValue('profile.name', 'Grace');

  // @ts-expect-error unknown fields are rejected
  form.setFieldValue('unknown', 'value');
});
