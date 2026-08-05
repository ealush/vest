import type { Resolver } from 'react-hook-form';

import { createRegistrationSuite, registrationSchema } from './suite';
import type {
  RegistrationContext,
  RegistrationInput,
  RegistrationOutput,
} from './suite';
import { vestResolver } from './vestResolver';

export function createRegistrationIntegration() {
  let isDisposed = false;
  let suite = createRegistrationSuite();
  let lifecycle = new AbortController();
  let resolver = vestResolver<typeof suite, RegistrationContext>(
    suite,
    registrationSchema,
    { signal: lifecycle.signal, suiteFactory: createRegistrationSuite },
  );

  const stableResolver: Resolver<
    RegistrationInput,
    RegistrationContext,
    RegistrationOutput
  > = (values, context, options) => {
    if (isDisposed) {
      return { errors: {}, values: values as unknown as RegistrationOutput };
    }
    return resolver(
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
  };

  function reset() {
    lifecycle.abort();
    suite.reset();
    isDisposed = false;
    lifecycle = new AbortController();
    suite = createRegistrationSuite();
    resolver = vestResolver<typeof suite, RegistrationContext>(
      suite,
      registrationSchema,
      { signal: lifecycle.signal, suiteFactory: createRegistrationSuite },
    );
  }

  function dispose() {
    lifecycle.abort();
    suite.reset();
    isDisposed = true;
  }

  return {
    dispose,
    getSuite: () => suite,
    reset,
    resolver: stableResolver,
  };
}
