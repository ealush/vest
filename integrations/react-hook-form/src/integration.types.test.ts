import { expectTypeOf, it } from 'vitest';
import {
  createFormControl,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';

import { createRegistrationIntegration } from './integration';
import {
  createRegistrationSuite,
  registrationSchema,
  validRegistration,
  type RegistrationContext,
  type RegistrationInput,
  type RegistrationOutput,
} from './suite';
import { vestResolver } from './vestResolver';

it('infers input, context, and transformed output from the Vest suite', () => {
  const suite = createRegistrationSuite();
  const resolver = vestResolver<typeof suite, RegistrationContext>(
    suite,
    registrationSchema,
    { suiteFactory: createRegistrationSuite },
  );
  const integration = createRegistrationIntegration();

  expectTypeOf(resolver).toEqualTypeOf<
    Resolver<RegistrationInput, RegistrationContext, RegistrationOutput>
  >();
  expectTypeOf(integration.resolver).toEqualTypeOf<
    Resolver<RegistrationInput, RegistrationContext, RegistrationOutput>
  >();

  const form = createFormControl<
    RegistrationInput,
    RegistrationContext,
    RegistrationOutput
  >({
    context: {
      getContactKey: index => String(index),
      isUsernameAvailable: () => true,
    },
    defaultValues: validRegistration,
    resolver,
  });
  const submit: SubmitHandler<RegistrationOutput> = values => {
    expectTypeOf(values.profile.age).toEqualTypeOf<number>();
    expectTypeOf(values.email).toEqualTypeOf<string>();
  };

  form.register('contacts.0.email');
  form.register('profile.name');
  form.handleSubmit(submit);

  // @ts-expect-error unknown fields are rejected
  form.register('unknown');
  const invalidSubmit: SubmitHandler<RegistrationOutput> = values => {
    // @ts-expect-error parsed age is a number, not a string
    values.profile.age.toUpperCase();
  };
  void invalidSubmit;
});

it('returns input values when raw mode is enabled', () => {
  const suite = createRegistrationSuite();
  const resolver = vestResolver<typeof suite, RegistrationContext>(
    suite,
    registrationSchema,
    { raw: true, suiteFactory: createRegistrationSuite },
  );

  expectTypeOf(resolver).toEqualTypeOf<
    Resolver<RegistrationInput, RegistrationContext, RegistrationInput>
  >();
});
