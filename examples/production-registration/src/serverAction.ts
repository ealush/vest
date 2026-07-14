'use server';

import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

import { registrationBoundarySchema } from './boundarySchema';
import { createRegistrationSuite } from './registrationSuite';

export async function registerAction(formData: FormData) {
  const rawInput = {
    accountType: formData.get('accountType'),
    companyName: formData.get('companyName') ?? '',
    confirmPassword: formData.get('confirmPassword'),
    email: formData.get('email'),
    marketingOptIn: formData.get('marketingOptIn') === 'on',
    password: formData.get('password'),
    username: formData.get('username'),
  };
  const parsed = registrationBoundarySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      boundaryIssues: parsed.error.flatten().fieldErrors,
    };
  }

  const suite = createRegistrationSuite({
    async isUsernameAvailable(username, signal) {
      const response = await fetch(
        `https://user-service.internal/usernames/${encodeURIComponent(username)}`,
        { signal },
      );
      const body: { available: boolean } = await response.json();
      return body.available;
    },
  });
  const result = await suite.runStatic(parsed.data);

  if (!result.isValid()) {
    return {
      ok: false as const,
      errors: result.getErrors(),
      vestState: SuiteSerializer.serialize(result),
    };
  }

  return { ok: true as const };
}
