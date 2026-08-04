import { create, enforce, mode, Modes, test } from 'vest';

export const registrationSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({ name: enforce.isString().trim() }),
});

export type RegistrationInput = Parameters<typeof registrationSchema.parse>[0];
export type RegistrationOutput = ReturnType<typeof registrationSchema.parse>;
export type RegistrationField = 'email' | 'profile.name';

export const registrationSuite = create<
  RegistrationField,
  string,
  (data: RegistrationOutput) => void,
  typeof registrationSchema
>(data => {
  mode(Modes.ALL);
  test('profile.name', 'Enter at least 2 characters', () => {
    enforce(data.profile.name.trim()).longerThanOrEquals(2);
  });
  test('email', 'Enter an email address', () => {
    enforce(data.email).matches(/@/);
  });
  test('email', 'Use the example.com domain', () => {
    enforce(data.email).endsWith('@example.com');
  });
}, registrationSchema);

export function validateRegistrationField(
  field: RegistrationField,
  data: RegistrationInput,
) {
  const result = registrationSuite.only(field).run(data);
  const errors = result.getErrors(field);

  return errors?.length ? errors : undefined;
}
