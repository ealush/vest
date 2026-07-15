import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { registrationBoundarySchema } from './boundarySchema';
import {
  createBrowserRegistrationSuite,
  createRegistrationSuite,
} from './registrationSuite';
import type { RegistrationPayload } from './boundarySchema';
import {
  emptyRegistration,
  type RegistrationData,
  type RegistrationField,
  type RegistrationStep,
} from './types';

type RegistrationSuite = ReturnType<typeof createRegistrationSuite>;

type RegistrationFormProps = {
  onRegister?: (payload: RegistrationPayload) => Promise<{ ok: boolean }>;
  suite?: RegistrationSuite;
};

async function registerWithApi(payload: RegistrationPayload) {
  return fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
  });
}

export function RegistrationForm({
  onRegister = registerWithApi,
  suite: providedSuite,
}: RegistrationFormProps = {}) {
  const [ownedSuite] = useState(createBrowserRegistrationSuite);
  const suite = providedSuite ?? ownedSuite;
  const ownsSuite = providedSuite === undefined;
  const form = useForm<RegistrationData>({
    criteriaMode: 'all',
    defaultValues: emptyRegistration,
    mode: 'onSubmit',
    resolver: standardSchemaResolver(suite),
  });
  const [validation, setValidation] = useState(() => suite.get());
  const [submitMessage, setSubmitMessage] = useState('');
  const accountType = form.watch('accountType');

  useEffect(() => {
    const unsubscribe = suite.subscribe(() => {
      setValidation(suite.get());
    });

    return () => {
      unsubscribe();
      if (ownsSuite) suite.reset();
    };
  }, [ownsSuite, suite]);

  function validateField<Field extends RegistrationField>(
    field: Field,
    value: RegistrationData[Field],
  ) {
    const next = { ...form.getValues(), [field]: value };
    suite.only(field).run(next);
  }

  async function validateStep(step: RegistrationStep) {
    const result = await suite.focus({ onlyGroup: step }).run(form.getValues());

    return result.isValidByGroup(step);
  }

  const submit = form.handleSubmit(
    async values => {
      setSubmitMessage('');

      // The Standard Schema resolver has awaited the full stateless Vest run.
      const payload = registrationBoundarySchema.parse(values);
      const response = await onRegister(payload);

      setSubmitMessage(
        response.ok ? 'Account created.' : 'Registration failed.',
      );
    },
    () => {
      setSubmitMessage('Correct the highlighted fields before continuing.');
    },
  );

  function feedback(field: RegistrationField) {
    const error = [
      validation.getError(field),
      form.formState.errors[field]?.message,
    ].find(Boolean);
    const state = [
      {
        active: validation.isPending(field),
        kind: 'pending',
        message: 'Checking…',
      },
      { active: Boolean(error), kind: 'error', message: String(error) },
      {
        active: validation.hasWarnings(field),
        kind: 'warning',
        message: validation.getWarning(field),
      },
      {
        active: validation.isTested(field),
        kind: 'valid',
        message: 'Looks good.',
      },
    ].find(candidate => candidate.active);

    if (!state) return null;
    if (state.kind === 'error') {
      return <small role="alert">{state.message}</small>;
    }

    return <small>{state.message}</small>;
  }

  return (
    <form onSubmit={submit}>
      <label>
        Email
        <input
          {...form.register('email', {
            onChange: event => validateField('email', event.target.value),
          })}
        />
      </label>
      {feedback('email')}

      <label>
        Username
        <input
          {...form.register('username', {
            onChange: event => validateField('username', event.target.value),
          })}
        />
      </label>
      {feedback('username')}

      <label>
        Password
        <input
          type="password"
          {...form.register('password', {
            onChange: event => validateField('password', event.target.value),
          })}
        />
      </label>
      {feedback('password')}

      <label>
        Confirm password
        <input
          type="password"
          {...form.register('confirmPassword', {
            onChange: event =>
              validateField('confirmPassword', event.target.value),
          })}
        />
      </label>
      {feedback('confirmPassword')}

      <label>
        Account type
        <select
          {...form.register('accountType', {
            onChange: event =>
              validateField(
                'accountType',
                event.target.value as RegistrationData['accountType'],
              ),
          })}
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>
      </label>

      {accountType === 'business' && (
        <label>
          Company name
          <input
            {...form.register('companyName', {
              onChange: event =>
                validateField('companyName', event.target.value),
            })}
          />
          {feedback('companyName')}
        </label>
      )}

      <label>
        <input type="checkbox" {...form.register('marketingOptIn')} />
        Product updates
      </label>

      <button type="button" onClick={() => void validateStep('account')}>
        Check account step
      </button>
      <button disabled={form.formState.isSubmitting} type="submit">
        Create account
      </button>
      <p aria-live="polite">{submitMessage}</p>
    </form>
  );
}
