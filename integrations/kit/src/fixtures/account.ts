import { create, enforce, test } from 'vest';

export const accountSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  password: enforce.isString(),
});

export type AccountInput = Parameters<typeof accountSchema.parse>[0];
export type AccountOutput = ReturnType<typeof accountSchema.parse>;

export const validAccount: AccountInput = {
  email: 'dev@example.com',
  password: 'securepass1',
};

export const rawAccountInput: AccountInput = {
  email: '  DEV@EXAMPLE.COM  ',
  password: 'securepass1',
};

export const canonicalAccountOutput: AccountOutput = {
  email: 'dev@example.com',
  password: 'securepass1',
};

export const invalidAccount: AccountInput = {
  email: 'invalid',
  password: 'short',
};

export function createAccountSuite() {
  return create(data => {
    test('email', 'Enter a valid email address', () => {
      enforce(data.email).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
    test('password', 'Use at least 10 characters', () => {
      enforce(data.password).longerThanOrEquals(10);
    });
  }, accountSchema);
}
