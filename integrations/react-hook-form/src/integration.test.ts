import { runFormIntegrationContract } from '@vest/integration-kit';
import {
  createFormControl,
  type FieldError,
  type FieldPath,
  type ResolverOptions,
  type ResolverResult,
} from 'react-hook-form';
import { create, enforce, test } from 'vest';
import { describe, expect, it, vi } from 'vitest';

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

const allFields = [
  'contacts.0.email',
  'email',
  'profile.age',
  'profile.name',
  'username',
] as const satisfies readonly FieldPath<RegistrationInput>[];

const availableContext: RegistrationContext = {
  getContactKey: index => String(index),
  isUsernameAvailable: () => true,
};

const invalidRegistration: RegistrationInput = {
  contacts: [{ email: 'invalid' }],
  email: 'invalid',
  profile: { age: '17', name: 'A' },
  username: 'taken',
};

describe('Vest 6 React Hook Form resolver candidate', () => {
  it('runs only the fields requested by React Hook Form', async () => {
    const integration = createRegistrationIntegration();

    const result = await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email']),
    );
    const suiteResult = integration.getSuite().get();

    expect(result.errors.email?.message).toBe('Enter an email address');
    expect(suiteResult.isTested('email')).toBe(true);
    expect(suiteResult.isTested('profile.name')).toBe(false);
    expect(suiteResult.isTested('contacts.0.email')).toBe(false);
  });

  it('supports multiple requested field names and retains unrelated results', async () => {
    const integration = createRegistrationIntegration();
    await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['contacts.0.email']),
    );
    await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email', 'profile.name']),
    );
    const result = integration.getSuite().get();

    expect(result.getErrors('contacts.0.email')).toEqual([
      'Enter a contact email address',
    ]);
    expect(result.getErrors('email')).toHaveLength(2);
    expect(result.getErrors('profile.name')).toEqual([
      'Enter at least 2 characters',
    ]);
    expect(result.isTested('profile.age')).toBe(false);
  });

  it('nests object and array errors through React Hook Form utilities', async () => {
    const integration = createRegistrationIntegration();
    const result = await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(allFields, 'all'),
    );

    expect(result.errors).toMatchObject({
      contacts: [{ email: { message: 'Enter a contact email address' } }],
      profile: {
        age: { message: 'You must be at least 18' },
        name: { message: 'Enter at least 2 characters' },
      },
    });
  });

  it('focuses and nests any field-array item', async () => {
    const integration = createRegistrationIntegration();
    let contactKeys = ['one', 'two', 'invalid'];
    const arrayContext: RegistrationContext = {
      ...availableContext,
      getContactKey: index => contactKeys[index],
    };
    const contacts = [
      { email: 'one@example.com' },
      { email: 'two@example.com' },
      { email: 'invalid' },
    ];
    const result = await integration.resolver(
      { ...validRegistration, contacts },
      arrayContext,
      resolverOptions(['contacts.2.email']),
    );

    const contactErrors = result.errors.contacts as Array<
      { email?: FieldError } | undefined
    >;
    expect(contactErrors[0]).toBeUndefined();
    expect(contactErrors[1]).toBeUndefined();
    expect(contactErrors[2]).toMatchObject({
      email: { message: 'Enter a contact email address' },
    });
    expect(integration.getSuite().get().isTested('contacts.0.email')).toBe(
      false,
    );

    contactKeys = contactKeys.slice(1);
    const reindexed = await integration.resolver(
      { ...validRegistration, contacts: contacts.slice(1) },
      arrayContext,
      resolverOptions(['contacts.1.email']),
    );

    const reindexedErrors = reindexed.errors.contacts as Array<
      { email?: FieldError } | undefined
    >;
    expect(reindexedErrors[1]).toMatchObject({
      email: { message: 'Enter a contact email address' },
    });
    expect(reindexedErrors[2]).toBeUndefined();
    expect(integration.getSuite().get().isTested('contacts.2.email')).toBe(
      false,
    );
  });

  it('reconciles a contact added after an earlier focused run', async () => {
    const integration = createRegistrationIntegration();
    const contactKeys = ['first'];
    const arrayContext: RegistrationContext = {
      ...availableContext,
      getContactKey: index => contactKeys[index],
    };
    await integration.resolver(
      { ...validRegistration, contacts: [{ email: 'one@example.com' }] },
      arrayContext,
      resolverOptions(['contacts.0.email']),
    );

    contactKeys.push('second');
    const result = await integration.resolver(
      {
        ...validRegistration,
        contacts: [{ email: 'one@example.com' }, { email: 'invalid' }],
      },
      arrayContext,
      resolverOptions(['contacts.1.email']),
    );

    expect(result.errors.contacts).toMatchObject([
      undefined,
      { email: { message: 'Enter a contact email address' } },
    ]);
  });

  it('expands a field-array root request to its current item fields', async () => {
    const integration = createRegistrationIntegration();
    const result = await integration.resolver(
      {
        ...validRegistration,
        contacts: [{ email: 'invalid' }, { email: 'two@example.com' }],
      },
      availableContext,
      resolverOptions(['contacts']),
    );
    const suiteResult = integration.getSuite().get();

    expect(result.errors.contacts).toMatchObject([
      { email: { message: 'Enter a contact email address' } },
    ]);
    expect(suiteResult.isTested('contacts.0.email')).toBe(true);
    expect(suiteResult.isTested('contacts.1.email')).toBe(true);
    expect(suiteResult.isTested('email')).toBe(false);
  });

  it('returns the first issue by default and every issue in all mode', async () => {
    const firstIntegration = createRegistrationIntegration();
    const first = await firstIntegration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email']),
    );
    const allIntegration = createRegistrationIntegration();
    const all = await allIntegration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email'], 'all'),
    );

    expect(first.errors.email).toMatchObject({
      message: 'Enter an email address',
      type: 'vest',
    });
    expect(first.errors.email?.types).toBeUndefined();
    expect(all.errors.email?.types).toEqual({
      vest: ['Enter an email address', 'Use the example.com domain'],
    });
  });

  it('returns parsed output to a real React Hook Form submission', async () => {
    const integration = createRegistrationIntegration();
    const onValid = vi.fn<(values: RegistrationOutput) => void>();
    const onInvalid = vi.fn();
    const form = createFormControl<
      RegistrationInput,
      RegistrationContext,
      RegistrationOutput
    >({
      context: availableContext,
      defaultValues: validRegistration,
      resolver: integration.resolver,
    });

    for (const field of allFields) form.register(field);
    await form.handleSubmit(onValid, onInvalid)();

    expect(onInvalid).not.toHaveBeenCalled();
    expect(onValid.mock.calls[0]?.[0]).toEqual({
      contacts: [{ email: 'team@example.com' }],
      email: 'dev@example.com',
      profile: { age: 42, name: 'Ada' },
      username: 'ada',
    });
  });

  it('supports raw output when requested', async () => {
    const suite = createRegistrationSuite();
    const resolver = vestResolver<typeof suite, RegistrationContext>(
      suite,
      registrationSchema,
      { raw: true, suiteFactory: createRegistrationSuite },
    );
    const result = await resolver(
      validRegistration,
      availableContext,
      resolverOptions(allFields),
    );

    expect(result.values).toEqual(validRegistration);
  });

  it('returns complete transformed output after focused validation', async () => {
    const integration = createRegistrationIntegration();
    const result = await integration.resolver(
      validRegistration,
      availableContext,
      resolverOptions(['email']),
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      contacts: [{ email: 'team@example.com' }],
      email: 'dev@example.com',
      profile: { age: 42, name: 'Ada' },
      username: 'ada',
    });
  });

  it('does not report unrelated schema issues during focused validation', async () => {
    const integration = createRegistrationIntegration();
    const values = {
      ...validRegistration,
      profile: { ...validRegistration.profile, age: 'not-a-number' },
    };
    const result = await integration.resolver(
      values,
      availableContext,
      resolverOptions(['email']),
    );

    expect(result.errors).toEqual({});
    expect(result.values).toEqual(values);
    expect(integration.getSuite().get().isTested('email')).toBe(true);
    expect(integration.getSuite().get().isTested('profile.age')).toBe(false);
  });

  it('clears corrected focused errors', async () => {
    const integration = createRegistrationIntegration();
    const invalid = await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email']),
    );
    const corrected = await integration.resolver(
      { ...invalidRegistration, email: 'dev@example.com' },
      availableContext,
      resolverOptions(['email']),
    );

    expect(invalid.errors.email).toBeDefined();
    expect(corrected.errors).toEqual({});
    expect(integration.getSuite().get().hasErrors('email')).toBe(false);
  });

  it('settles overlapping async calls with the latest field result', async () => {
    const integration = createRegistrationIntegration();
    let firstSignal: AbortSignal | undefined;
    let releaseFirst: ((available: boolean) => void) | undefined;
    const firstAvailability = new Promise<boolean>(resolve => {
      releaseFirst = resolve;
    });
    const context: RegistrationContext = {
      ...availableContext,
      isUsernameAvailable(username, signal) {
        if (username === 'slow') {
          firstSignal = signal;
          signal.addEventListener('abort', () => releaseFirst?.(false), {
            once: true,
          });
          return firstAvailability;
        }
        return Promise.resolve(true);
      },
    };

    const first = integration.resolver(
      { ...validRegistration, username: 'slow' },
      context,
      resolverOptions(['username']),
    );
    const second = integration.resolver(
      { ...validRegistration, username: 'available' },
      context,
      resolverOptions(['username']),
    );
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstSignal?.aborted).toBe(true);
    expect(firstResult.errors).toEqual({});
    expect(secondResult.errors).toEqual({});
    expect(integration.getSuite().get().hasErrors('username')).toBe(false);
  });

  it('keeps a full submission isolated from a later focused run', async () => {
    const integration = createRegistrationIntegration();
    let releaseFullRun: ((available: boolean) => void) | undefined;
    const fullRunAvailability = new Promise<boolean>(resolve => {
      releaseFullRun = resolve;
    });
    const context: RegistrationContext = {
      ...availableContext,
      isUsernameAvailable(username) {
        if (username === 'slow') {
          return fullRunAvailability;
        }
        return true;
      },
    };
    const fullRun = integration.resolver(
      { ...validRegistration, username: 'slow' },
      context,
      resolverOptions(allFields),
    );
    const focusedRun = integration.resolver(
      { ...validRegistration, email: 'invalid' },
      context,
      resolverOptions(['email']),
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    releaseFullRun?.(true);
    const [fullResult, focusedResult] = await Promise.all([
      fullRun,
      focusedRun,
    ]);

    expect(fullResult.errors).toEqual({});
    expect(fullResult.values.email).toBe('dev@example.com');
    expect(focusedResult.errors.email?.message).toBe('Enter an email address');
  });

  it('keeps concurrent full runs invocation-specific', async () => {
    const integration = createRegistrationIntegration();
    let releaseSlowRun: ((available: boolean) => void) | undefined;
    const slowRunAvailability = new Promise<boolean>(resolve => {
      releaseSlowRun = resolve;
    });
    const context: RegistrationContext = {
      ...availableContext,
      isUsernameAvailable(username) {
        if (username === 'slow') {
          return slowRunAvailability;
        }
        return true;
      },
    };
    const slowValid = integration.resolver(
      { ...validRegistration, username: 'slow' },
      context,
      resolverOptions(allFields),
    );
    const fastInvalid = integration.resolver(
      { ...validRegistration, email: 'invalid' },
      context,
      resolverOptions(allFields),
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    releaseSlowRun?.(true);
    const [validResult, invalidResult] = await Promise.all([
      slowValid,
      fastInvalid,
    ]);

    expect(validResult.errors).toEqual({});
    expect(validResult.values.email).toBe('dev@example.com');
    expect(invalidResult.errors.email?.message).toBe('Enter an email address');
  });

  it('keeps independent form suites isolated', async () => {
    const invalid = createRegistrationIntegration();
    const valid = createRegistrationIntegration();

    await Promise.all([
      invalid.resolver(
        invalidRegistration,
        availableContext,
        resolverOptions(['email']),
      ),
      valid.resolver(
        validRegistration,
        availableContext,
        resolverOptions(['email']),
      ),
    ]);

    expect(invalid.getSuite().get().hasErrors('email')).toBe(true);
    expect(valid.getSuite().get().hasErrors('email')).toBe(false);
  });

  it('replaces retained state on reset and disposes integration on unmount', async () => {
    const integration = createRegistrationIntegration();
    await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email']),
    );
    const firstSuite = integration.getSuite();

    integration.reset();
    expect(integration.getSuite()).not.toBe(firstSuite);
    expect(integration.getSuite().get().isTested('email')).toBe(false);

    await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['profile.name']),
    );
    const resetSuite = integration.getSuite();
    integration.dispose();

    expect(integration.getSuite()).toBe(resetSuite);
    expect(integration.getSuite().get().isTested('profile.name')).toBe(false);

    expect(() =>
      integration.resolver(
        invalidRegistration,
        availableContext,
        resolverOptions(['email']),
      ),
    ).toThrow('The Vest React Hook Form integration has been disposed.');
  });

  it.each(['reset', 'dispose'] as const)(
    'cancels and settles pending validation during %s cleanup',
    async cleanup => {
      const integration = createRegistrationIntegration();
      let availabilitySignal: AbortSignal | undefined;
      const pending = integration.resolver(
        { ...validRegistration, username: 'slow' },
        {
          ...availableContext,
          isUsernameAvailable(_username, signal) {
            availabilitySignal = signal;
            return new Promise<boolean>(resolve => {
              signal.addEventListener('abort', () => resolve(true), {
                once: true,
              });
            });
          },
        },
        resolverOptions(['username']),
      );

      integration[cleanup]();
      await pending;

      expect(availabilitySignal?.aborted).toBe(true);
      expect(integration.getSuite().get().isTested('username')).toBe(false);
    },
  );

  it('cancels a pending submission during unmount cleanup', async () => {
    const integration = createRegistrationIntegration();
    let availabilitySignal: AbortSignal | undefined;
    const pending = integration.resolver(
      { ...validRegistration, username: 'slow' },
      {
        ...availableContext,
        isUsernameAvailable(_username, signal) {
          availabilitySignal = signal;
          return new Promise<boolean>(resolve => {
            signal.addEventListener('abort', () => resolve(true), {
              once: true,
            });
          });
        },
      },
      resolverOptions(allFields),
    );

    integration.dispose();
    await pending;

    expect(availabilitySignal?.aborted).toBe(true);
    expect(integration.getSuite().get().isTested('username')).toBe(false);
  });

  it('does not report unrelated test failures when schema parsing fails', async () => {
    const integration = createRegistrationIntegration();
    const result = await integration.resolver(
      {
        ...validRegistration,
        profile: { ...validRegistration.profile, age: 'not-a-number' },
      },
      availableContext,
      resolverOptions(allFields, 'all'),
    );

    expect(result.errors.profile?.age).toBeDefined();
    expect(result.errors.email).toBeUndefined();
    expect(result.errors.contacts).toBeUndefined();
  });

  it('uses native validation reporting for invalid and corrected fields', async () => {
    const integration = createRegistrationIntegration();
    const setCustomValidity = vi.fn();
    const reportValidity = vi.fn();
    const options = resolverOptions(['email'], undefined, {
      name: 'email',
      reportValidity,
      setCustomValidity,
    });

    await integration.resolver(invalidRegistration, availableContext, options);
    await integration.resolver(
      { ...invalidRegistration, email: 'dev@example.com' },
      availableContext,
      options,
    );

    expect(setCustomValidity).toHaveBeenNthCalledWith(
      1,
      'Enter an email address',
    );
    expect(setCustomValidity).toHaveBeenLastCalledWith('');
    expect(reportValidity).toHaveBeenCalledTimes(2);
  });

  it('supports synchronous suites and rejects async work in sync mode', () => {
    const schema = enforce.shape({ email: enforce.isString().trim() });
    const createSyncSuite = () =>
      create<'email', string, (data: { email: string }) => void, typeof schema>(
        data => {
          test('email', 'Required', () => {
            enforce(data.email).isNotBlank();
          });
        },
        schema,
      );
    const syncSuite = createSyncSuite();
    const syncResolver = vestResolver(syncSuite, schema, {
      mode: 'sync',
      suiteFactory: createSyncSuite,
    });
    const syncResult = syncResolver(
      { email: '' },
      undefined,
      resolverOptionsFor<{ email: string }>(['email']),
    );
    const asyncSuite = createRegistrationSuite();
    const invalidSyncResolver = vestResolver<
      typeof asyncSuite,
      RegistrationContext
    >(asyncSuite, registrationSchema, {
      mode: 'sync',
      suiteFactory: createRegistrationSuite,
    });

    expect(syncResult).not.toBeInstanceOf(Promise);
    expect(
      (syncResult as ResolverResult<{ email: string }>).errors.email?.message,
    ).toBe('Required');
    expect(() =>
      invalidSyncResolver(
        validRegistration,
        availableContext,
        resolverOptions(allFields),
      ),
    ).toThrow(/started asynchronous validation/);
  });

  it('passes the framework-neutral form integration contract', async () => {
    const integration = createRegistrationIntegration();

    await runFormIntegrationContract(
      {
        async submit(values) {
          const result = await integration.resolver(
            values,
            availableContext,
            resolverOptions(allFields, 'all'),
          );
          return Object.keys(result.errors).length
            ? { errors: result.errors, success: false as const }
            : { success: true as const, value: result.values };
        },
      },
      {
        hasErrors: errors => Object.keys(errors).length > 0,
        invalidInput: invalidRegistration,
        isSuccessfulOutput: value => value.profile.age === 42,
        validInput: validRegistration,
      },
    );
  });
});

describe('review regressions', () => {
  it('empty containers during single-field validation', async () => {
    const integration = createRegistrationIntegration();
    const emptyContainerValues: RegistrationInput = {
      contacts: [],
      email: 'dev@example.com',
      profile: {} as RegistrationInput['profile'],
      username: 'ada',
    };

    const result = await integration.resolver(
      emptyContainerValues,
      availableContext,
      resolverOptions(['email']),
    );

    const suiteResult = integration.getSuite().get();
    expect(suiteResult.isTested('email')).toBe(true);
    expect(suiteResult.isTested('username')).toBe(false);
    expect(result.errors.email).toBeUndefined();
  });

  it('trigger() without args vs trigger with all fields vs handleSubmit', async () => {
    const integration = createRegistrationIntegration();
    const form = createFormControl<
      RegistrationInput,
      RegistrationContext,
      RegistrationOutput
    >({
      context: availableContext,
      defaultValues: invalidRegistration,
      resolver: integration.resolver,
    });

    for (const field of allFields) form.register(field);

    const allValid = await form.trigger();
    expect(allValid).toBe(false);

    const emailValid = await form.trigger('email');
    expect(emailValid).toBe(false);

    const explicitAllValid = await form.trigger([...allFields]);
    expect(explicitAllValid).toBe(false);
  });

  it('async dependent-field — suite.only prevents cross-field async from starting', async () => {
    let resolveUsername: ((available: boolean) => void) | undefined;
    const crossFieldContext: RegistrationContext = {
      ...availableContext,
      isUsernameAvailable(_username, _signal) {
        return new Promise<boolean>(resolve => {
          resolveUsername = resolve;
        });
      },
    };

    const integration = createRegistrationIntegration();
    const resultPromise = integration.resolver(
      validRegistration,
      crossFieldContext,
      resolverOptions(['email']),
    );

    const result = await resultPromise;
    resolveUsername?.(true);

    expect(result.errors).toEqual({});
    expect(integration.getSuite().get().isTested('username')).toBe(false);
  });

  it('maps pathless issues to errors.root', async () => {
    const schema = enforce.shape({ email: enforce.isString().trim() });
    const createSuiteWithRoot = () =>
      create<'email', string, (data: { email: string }) => void, typeof schema>(
        data => {
          test('email', 'Email required', () => {
            enforce(data.email).isNotBlank();
          });
          test('' as unknown as 'email', 'Form-level error', () => {
            enforce(false).isTruthy();
          });
        },
        schema,
      );

    const suite = createSuiteWithRoot();
    const resolver = vestResolver(suite, schema, {
      mode: 'sync',
      suiteFactory: createSuiteWithRoot,
    });
    const result = resolver(
      { email: 'valid@example.com' },
      undefined,
      resolverOptionsFor<{ email: string }>([] as unknown as ['email']),
    ) as ResolverResult<{ email: string }>;

    expect(result.errors.root).toBeDefined();
    expect(result.errors.root?.message).toBe('Form-level error');
  });

  it('shouldUnregister does not affect resolver behavior', async () => {
    const integration = createRegistrationIntegration();
    const form = createFormControl<
      RegistrationInput,
      RegistrationContext,
      RegistrationOutput
    >({
      context: availableContext,
      defaultValues: invalidRegistration,
      resolver: integration.resolver,
      shouldUnregister: true,
    });

    form.register('email');
    form.register('profile.name');

    const onInvalid = vi.fn();
    await form.handleSubmit(vi.fn(), onInvalid)();

    expect(onInvalid).toHaveBeenCalled();
  });
});

describe('known unresolved gaps', () => {
  it.fails(
    'unregistered invalid defaultValues field passes submit validation',
    async () => {
      const integration = createRegistrationIntegration();
      const onValid = vi.fn<(values: RegistrationOutput) => void>();
      const onInvalid = vi.fn();

      const form = createFormControl<
        RegistrationInput,
        RegistrationContext,
        RegistrationOutput
      >({
        context: availableContext,
        defaultValues: {
          ...validRegistration,
          profile: {
            ...validRegistration.profile,
            age: 'not-a-number',
          },
        },
        resolver: integration.resolver,
      });

      form.register('email');

      await form.handleSubmit(onValid, onInvalid)();

      expect(onValid).not.toHaveBeenCalled();
      expect(onInvalid).toHaveBeenCalled();
      expect(onInvalid.mock.calls[0]?.[0].profile?.age).toBeDefined();
    },
  );

  it.fails(
    'invalid submit followed by correcting one field marks formState.isValid true',
    async () => {
      const integration = createRegistrationIntegration();

      const form = createFormControl<
        RegistrationInput,
        RegistrationContext,
        RegistrationOutput
      >({
        context: availableContext,
        defaultValues: invalidRegistration,
        resolver: integration.resolver,
      });

      for (const field of allFields) form.register(field);

      const onValid = vi.fn();
      const onInvalid = vi.fn();
      await form.handleSubmit(onValid, onInvalid)();
      expect(onInvalid).toHaveBeenCalled();

      form.setValue('email', 'dev@example.com');
      await form.trigger('email');

      expect(form.getFieldState('profile.name').error).toBeDefined();

      const formState = (form as unknown as { formState: { isValid: boolean } })
        .formState;
      expect(formState.isValid).toBe(false);
    },
  );

  it.fails('RHF reset without integration.reset leaks old state', async () => {
    const integration = createRegistrationIntegration();
    const form = createFormControl<
      RegistrationInput,
      RegistrationContext,
      RegistrationOutput
    >({
      context: availableContext,
      defaultValues: invalidRegistration,
      resolver: integration.resolver,
    });

    for (const field of allFields) form.register(field);

    await integration.resolver(
      invalidRegistration,
      availableContext,
      resolverOptions(['email']),
    );
    expect(integration.getSuite().get().hasErrors('email')).toBe(true);

    form.reset(validRegistration);

    expect(integration.getSuite().get().hasErrors('email')).toBe(false);
  });

  it.fails(
    'focused call returns untransformed input cast as output type',
    async () => {
      const integration = createRegistrationIntegration();
      const values = {
        ...validRegistration,
        profile: { ...validRegistration.profile, age: 'not-a-number' },
      };
      const result = await integration.resolver(
        values,
        availableContext,
        resolverOptions(['email']),
      );

      expect(result.errors).toEqual({});

      const output = result.values as RegistrationOutput;
      expect(typeof output.profile.age).toBe('number');
    },
  );
});

function resolverOptions(
  names: readonly FieldPath<RegistrationInput>[],
  criteriaMode?: 'all' | 'firstError',
  ref?: {
    name: string;
    reportValidity(): void;
    setCustomValidity(message: string): void;
  },
): ResolverOptions<RegistrationInput> {
  return resolverOptionsFor(names, criteriaMode, ref);
}

function resolverOptionsFor<Input extends Record<string, unknown>>(
  names: readonly FieldPath<Input>[],
  criteriaMode?: 'all' | 'firstError',
  ref?: {
    name: string;
    reportValidity(): void;
    setCustomValidity(message: string): void;
  },
): ResolverOptions<Input> {
  const fields = Object.fromEntries(
    names.map(name => [name, { ref: ref ?? { name } }]),
  ) as ResolverOptions<Input>['fields'];

  return {
    criteriaMode,
    fields,
    names: [...names] as unknown as ResolverOptions<Input>['names'],
    shouldUseNativeValidation: Boolean(ref),
  };
}
