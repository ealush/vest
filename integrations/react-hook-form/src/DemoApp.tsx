import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useFieldArray, useForm, type FieldError } from 'react-hook-form';

import { createRegistrationIntegration } from './integration';
import {
  emptyRegistration,
  type RegistrationContext,
  type RegistrationInput,
  type RegistrationOutput,
} from './suite';
import './styles.css';

export default function DemoApp() {
  const integration = useMemo(createRegistrationIntegration, []);
  const contactKeys = useRef<string[]>([]);
  const context = useMemo<RegistrationContext>(
    () => ({
      getContactKey: index => contactKeys.current[index] ?? String(index),
      isUsernameAvailable: checkUsernameAvailability,
    }),
    [],
  );
  const [submitted, setSubmitted] = useState<RegistrationOutput>();
  const form = useForm<
    RegistrationInput,
    RegistrationContext,
    RegistrationOutput
  >({
    context,
    criteriaMode: 'all',
    defaultValues: emptyRegistration,
    mode: 'onChange',
    resolver: integration.resolver,
  });
  const contacts = useFieldArray({ control: form.control, name: 'contacts' });
  contactKeys.current = contacts.fields.map(contact => contact.id);

  useEffect(() => () => integration.dispose(), [integration]);

  const errors = form.formState.errors;

  return (
    <main>
      <p className="eyebrow">Resolver example</p>
      <h1>Vest with React Hook Form</h1>
      <p>
        React Hook Form requests focused Vest runs while the resolver maps
        nested errors and parsed output.
      </p>
      <form onSubmit={form.handleSubmit(setSubmitted)}>
        <Field label="Name" messages={errorMessages(errors.profile?.name)}>
          <input id="name" {...form.register('profile.name')} />
        </Field>
        <Field label="Age" messages={errorMessages(errors.profile?.age)}>
          <input
            id="age"
            inputMode="numeric"
            {...form.register('profile.age')}
          />
        </Field>
        <Field label="Email" messages={errorMessages(errors.email)}>
          <input id="email" type="email" {...form.register('email')} />
        </Field>
        <fieldset>
          <legend>Contact emails</legend>
          {contacts.fields.map((contact, index) => (
            <div className="contact" key={contact.id}>
              <Field
                label={`Contact ${index + 1}`}
                messages={errorMessages(errors.contacts?.[index]?.email)}
              >
                <input
                  id={`contact-email-${index}`}
                  type="email"
                  {...form.register(`contacts.${index}.email` as const)}
                />
              </Field>
              {contacts.fields.length > 1 && (
                <button
                  className="secondary compact"
                  type="button"
                  onClick={() => contacts.remove(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            className="secondary"
            type="button"
            onClick={() => contacts.append({ email: '' })}
          >
            Add contact
          </button>
        </fieldset>
        <Field label="Username" messages={errorMessages(errors.username)}>
          <input id="username" {...form.register('username')} />
        </Field>
        <p aria-live="polite" className="status">
          {form.formState.isValidating
            ? 'Checking availability…'
            : 'Try “taken” to see asynchronous validation.'}
        </p>
        <div className="actions">
          <button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              form.reset(emptyRegistration);
              integration.reset();
              setSubmitted(undefined);
            }}
          >
            Reset
          </button>
        </div>
      </form>
      {submitted && <pre>{JSON.stringify(submitted, null, 2)}</pre>}
    </main>
  );
}

function Field({
  children,
  label,
  messages,
}: {
  children: ReactElement<{ id: string }>;
  label: string;
  messages: string[];
}) {
  const id = children.props.id;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {messages.map(message => (
        <span key={message}>{message}</span>
      ))}
    </div>
  );
}

function errorMessages(error: FieldError | undefined): string[] {
  if (!error) return [];
  if (error.types) {
    return [...new Set(Object.values(error.types).flat().map(String))];
  }
  return error.message ? [error.message] : [];
}

async function checkUsernameAvailability(
  username: string,
  signal: AbortSignal,
) {
  await new Promise<void>(resolve => {
    const timeout = setTimeout(resolve, 350);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
  return !signal.aborted && username !== 'taken';
}
