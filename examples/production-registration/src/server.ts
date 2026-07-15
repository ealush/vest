import { registrationBoundarySchema } from './boundarySchema';
import {
  createRegistrationSuite,
  type RegistrationServices,
} from './registrationSuite';

export async function handleRegistration(
  rawInput: unknown,
  services: RegistrationServices,
) {
  const parsed = registrationBoundarySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { issues: parsed.error.flatten().fieldErrors },
    };
  }

  const requestSuite = createRegistrationSuite(services);
  const result = await requestSuite.runStatic(parsed.data);

  if (!result.isValid()) {
    return {
      status: 422 as const,
      body: { errors: result.getErrors() },
    };
  }

  return {
    status: 201 as const,
    body: {
      account: {
        accountType: parsed.data.accountType,
        companyName: parsed.data.companyName,
        email: parsed.data.email,
        marketingOptIn: parsed.data.marketingOptIn,
        username: parsed.data.username,
      },
    },
  };
}
