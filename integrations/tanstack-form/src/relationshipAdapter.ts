import 'vest/relationships';
import { create, enforce, test } from 'vest';

export const passwordSchema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().dependsOn($ => $.password),
});

export type PasswordInput = Parameters<typeof passwordSchema.parse>[0];
export type PasswordField = 'password' | 'confirm';
export type FieldErrors = Partial<Record<PasswordField, string[]>>;
const passwordFields: readonly PasswordField[] = ['password', 'confirm'];

/** An instance-owned adapter for field change validators. */
export function createPasswordRelationshipAdapter(
  checkPassword: (
    password: string,
    signal: AbortSignal,
  ) => void | Promise<void> = () => {},
) {
  const suite = create<
    PasswordField,
    string,
    (data: PasswordInput) => void,
    typeof passwordSchema
  >(data => {
    test('password', 'Password is unavailable', async ({ signal }) => {
      await checkPassword(data.password, signal);
    });
    test('confirm', 'Passwords do not match', () => {
      enforce(data.confirm).equals(data.password);
    });
  }, passwordSchema);

  return {
    suite,
    async validateChange(
      field: PasswordField,
      data: PasswordInput,
    ): Promise<FieldErrors> {
      const result = await suite.changed(field).run(data);
      const errors: FieldErrors = {};
      for (const error of result.errors) {
        const name = error.fieldName;
        if (!isPasswordField(name)) continue;
        errors[name] ??= [];
        errors[name].push(error.message ?? 'Validation failed');
      }
      return errors;
    },
  };
}

function isPasswordField(name: string): name is PasswordField {
  return (passwordFields as readonly string[]).includes(name);
}

/** Report dependent errors; return this field's error to its native validator. */
export function createPasswordChangeValidator(
  adapter: ReturnType<typeof createPasswordRelationshipAdapter>,
  field: PasswordField,
  report: (field: PasswordField, errors: string[] | undefined) => void,
) {
  return async (data: PasswordInput) => {
    const errors = await adapter.validateChange(field, data);
    for (const dependent of passwordFields) {
      if (dependent !== field) report(dependent, errors[dependent]);
    }
    return errors[field];
  };
}
