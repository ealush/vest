import { create, enforce, test } from 'vest';

export interface AccountInput {
  email: string;
  password: string;
}

export const validAccount: AccountInput = {
  email: 'dev@example.com',
  password: 'securepass1',
};

export const invalidAccount: AccountInput = {
  email: 'invalid',
  password: 'short',
};

export function createAccountSuite() {
  return create((data: AccountInput) => {
    test('email', 'Enter a valid email address', () => {
      enforce(data.email).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
    test('password', 'Use at least 10 characters', () => {
      enforce(data.password).longerThanOrEquals(10);
    });
  });
}
