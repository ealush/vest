import {
  create,
  enforce,
  group,
  include,
  omitWhen,
  skipWhen,
  test,
  warn,
} from 'vest';

import type { RegistrationData } from './types';

export type RegistrationServices = {
  isUsernameAvailable: (
    username: string,
    signal: AbortSignal,
  ) => Promise<boolean>;
};

export function createRegistrationSuite(services: RegistrationServices) {
  return create((data: RegistrationData) => {
    include('confirmPassword').when('password');
    include('companyName').when('accountType');

    group('account', () => {
      test('email', 'Enter a valid email address', () => {
        enforce(data.email.trim()).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      test('username', 'Username must contain at least 3 characters', () => {
        enforce(data.username.trim()).longerThanOrEquals(3);
      });

      skipWhen(
        result => result.hasErrors('username'),
        () => {
          test('username', 'Username is already taken', async ({ signal }) => {
            const available = await services.isUsernameAvailable(
              data.username,
              signal,
            );
            enforce(available).isTruthy();
          });
        },
      );

      test('password', 'Password must contain at least 10 characters', () => {
        enforce(data.password).longerThanOrEquals(10);
      });

      test('password', 'Add a number for a stronger password', () => {
        warn();
        enforce(data.password).matches(/\d/);
      });

      test('confirmPassword', 'Passwords do not match', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    });

    group('company', () => {
      omitWhen(data.accountType !== 'business', () => {
        test(
          'companyName',
          'Company name is required for business accounts',
          () => {
            enforce(data.companyName).isNotBlank();
          },
        );
      });
    });
  });
}

export const registrationSuite = createRegistrationSuite({
  async isUsernameAvailable(username, signal) {
    const response = await fetch(
      `/api/usernames/${encodeURIComponent(username)}`,
      { signal },
    );

    if (!response.ok) {
      throw new Error('Could not check username availability');
    }

    const body: { available: boolean } = await response.json();
    return body.available;
  },
});
