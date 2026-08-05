import { create, enforce, mode, Modes, test } from 'vest';

export const accountSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({
    age: enforce.isNumeric().toNumber(),
    name: enforce.isString().trim(),
  }),
});

export type AccountInput = Parameters<typeof accountSchema.parse>[0];
export type AccountOutput = ReturnType<typeof accountSchema.parse>;

export const accountSuite = create(data => {
  mode(Modes.ALL);
  test('profile.name', 'Name must contain at least 2 characters', () => {
    enforce(data.profile.name.trim()).longerThanOrEquals(2);
  });
  test('email', 'Email must contain an @ sign', () => {
    enforce(data.email.trim().toLowerCase()).matches(/@/);
  });
  test('email', 'Email must use the example.com domain', () => {
    enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
  });
}, accountSchema);

export const usernameSchema = enforce.shape({
  username: enforce.isString().trim(),
});

export type UsernameInput = Parameters<typeof usernameSchema.parse>[0];
export type UsernameOutput = ReturnType<typeof usernameSchema.parse>;

export function createUsernameSuite(
  isAvailable: (username: string) => Promise<boolean>,
) {
  return create(data => {
    test('username', 'Username is already taken', async () => {
      enforce(await isAvailable(data.username)).isTruthy();
    });
  }, usernameSchema);
}
