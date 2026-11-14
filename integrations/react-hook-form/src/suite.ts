import { create, each, enforce, mode, Modes, test } from 'vest';

export const registrationSchema = enforce.shape({
  contacts: enforce.isArrayOf(
    enforce.shape({ email: enforce.isString().trim().toLower() }),
  ),
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({
    age: enforce.isNumeric().toNumber(),
    name: enforce.isString().trim(),
  }),
  username: enforce.isString().trim().toLower(),
});

export type RegistrationInput = Parameters<typeof registrationSchema.parse>[0];
export type RegistrationOutput = ReturnType<typeof registrationSchema.parse>;
export type RegistrationField =
  | `contacts.${number}.email`
  | 'email'
  | 'profile.age'
  | 'profile.name'
  | 'username';

export type RegistrationContext = {
  getContactKey(index: number): string;
  isUsernameAvailable(
    username: string,
    signal: AbortSignal,
  ): boolean | Promise<boolean>;
};

const defaultContext: RegistrationContext = {
  getContactKey: index => String(index),
  isUsernameAvailable: username => username !== 'taken',
};

export function createRegistrationSuite() {
  return create<
    RegistrationField,
    string,
    (data: RegistrationOutput, context?: RegistrationContext) => void,
    typeof registrationSchema
  >((data, context = defaultContext) => {
    mode(Modes.ALL);

    test('profile.name', 'Enter at least 2 characters', () => {
      enforce(data.profile.name.trim()).longerThanOrEquals(2);
    });
    test('profile.age', 'You must be at least 18', () => {
      enforce(Number(data.profile.age)).greaterThanOrEquals(18);
    });
    test('email', 'Enter an email address', () => {
      enforce(data.email.trim().toLowerCase()).matches(/@/);
    });
    test('email', 'Use the example.com domain', () => {
      enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
    });

    each(data.contacts ?? [], (contact, index) => {
      const field = `contacts.${index}.email` as RegistrationField;
      test(
        field,
        'Enter a contact email address',
        () => {
          enforce(contact.email.trim().toLowerCase()).matches(/@/);
        },
        context.getContactKey(index),
      );
    });

    test('username', 'That username is unavailable', async ({ signal }) => {
      const available = await context.isUsernameAvailable(
        data.username.trim().toLowerCase(),
        signal,
      );
      enforce(available).isTruthy();
    });
  }, registrationSchema);
}

export const emptyRegistration: RegistrationInput = {
  contacts: [{ email: '' }],
  email: '',
  profile: { age: '', name: '' },
  username: '',
};

export const validRegistration: RegistrationInput = {
  contacts: [{ email: '  TEAM@EXAMPLE.COM  ' }],
  email: '  DEV@EXAMPLE.COM  ',
  profile: { age: '42', name: '  Ada  ' },
  username: '  ada  ',
};
