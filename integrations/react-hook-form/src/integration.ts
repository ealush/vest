import type { Resolver } from 'react-hook-form';

import { createRegistrationSuite, registrationSchema } from './suite';
import type {
  RegistrationContext,
  RegistrationInput,
  RegistrationOutput,
} from './suite';
import { vestResolver } from './vestResolver';

export function createRegistrationIntegration() {
  let suite = createRegistrationSuite();
  let resolver = vestResolver<typeof suite, RegistrationContext>(
    suite,
    registrationSchema,
    { suiteFactory: createRegistrationSuite },
  );
  let lifecycle = new AbortController();

  const stableResolver: Resolver<
    RegistrationInput,
    RegistrationContext,
    RegistrationOutput
  > = (values, context, options) =>
    resolver(
      values,
      context && {
        ...context,
        isUsernameAvailable(username, signal) {
          return context.isUsernameAvailable(
            username,
            AbortSignal.any([signal, lifecycle.signal]),
          );
        },
      },
      options,
    );

  function replaceSuite() {
    lifecycle.abort();
    suite.reset();
    lifecycle = new AbortController();
    suite = createRegistrationSuite();
    resolver = vestResolver<typeof suite, RegistrationContext>(
      suite,
      registrationSchema,
      { suiteFactory: createRegistrationSuite },
    );
  }

  return {
    dispose: replaceSuite,
    getSuite: () => suite,
    reset: replaceSuite,
    resolver: stableResolver,
  };
}
