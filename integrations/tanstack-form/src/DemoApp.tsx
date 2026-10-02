import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';

import { createRegistrationIntegration } from './suite';
import './styles.css';

function errorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
}

export default function DemoApp() {
  const [submitted, setSubmitted] = useState<string>();
  const integration = useMemo(createRegistrationIntegration, []);
  const form = useForm({
    defaultValues: { email: '', profile: { name: '' } },
    validators: {
      onSubmit: integration.suite,
    },
    onSubmit: ({ value }) => setSubmitted(JSON.stringify(value, null, 2)),
  });

  return (
    <main>
      <p className="eyebrow">Form validation example</p>
      <h1>Vest with TanStack Form</h1>
      <p>A Vest suite validates the complete form through Standard Schema.</p>
      <form
        onSubmit={event => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="profile.name"
          validators={{
            onChange: ({ value, fieldApi }) =>
              integration.validateField('profile.name', {
                ...fieldApi.form.state.values,
                profile: {
                  ...fieldApi.form.state.values.profile,
                  name: value,
                },
              }),
          }}
        >
          {field => (
            <label>
              Name
              <input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => field.handleChange(event.target.value)}
              />
              <span>{errorMessage(field.state.meta.errors[0])}</span>
            </label>
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value, fieldApi }) =>
              integration.validateField('email', {
                ...fieldApi.form.state.values,
                email: value,
              }),
          }}
        >
          {field => (
            <label>
              Email
              <input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => field.handleChange(event.target.value)}
              />
              {[
                ...new Set(
                  field.state.meta.errors.flatMap(
                    error => errorMessage(error) ?? [],
                  ),
                ),
              ].map(message => (
                <span key={message}>{message}</span>
              ))}
            </label>
          )}
        </form.Field>
        <button type="submit">Submit</button>
      </form>
      {submitted && <pre>{submitted}</pre>}
    </main>
  );
}
