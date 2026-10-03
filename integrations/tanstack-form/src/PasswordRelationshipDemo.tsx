import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';

import {
  createPasswordChangeValidator,
  createPasswordRelationshipAdapter,
} from './relationshipAdapter';

export function PasswordRelationshipDemo() {
  const adapter = useMemo(createPasswordRelationshipAdapter, []);
  const [submitted, setSubmitted] = useState(false);
  const form = useForm({
    defaultValues: { password: '', confirm: '' },
    validators: { onSubmit: adapter.suite },
    onSubmit: () => setSubmitted(true),
  });
  const report = (
    field: 'password' | 'confirm',
    errors: string[] | undefined,
  ) => {
    form.setFieldMeta(field, previous => ({
      ...previous,
      errorMap: { ...previous.errorMap, onChange: errors },
    }));
  };
  const password = createPasswordChangeValidator(adapter, 'password', report);
  const confirm = createPasswordChangeValidator(adapter, 'confirm', report);

  return (
    <section>
      <h2>Related password fields</h2>
      <p>Changing the password also checks the confirmation.</p>
      <form
        onSubmit={event => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="password"
          validators={{
            onChangeAsync: ({ fieldApi }) =>
              password(fieldApi.form.state.values),
          }}
        >
          {field => (
            <label>
              Password
              <input
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => {
                  setSubmitted(false);
                  field.handleChange(event.target.value);
                }}
              />
              <span>{field.state.meta.errors.flat().join(', ')}</span>
            </label>
          )}
        </form.Field>
        <form.Field
          name="confirm"
          validators={{
            onChangeAsync: ({ fieldApi }) =>
              confirm(fieldApi.form.state.values),
          }}
        >
          {field => (
            <label>
              Confirmation
              <input
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => {
                  setSubmitted(false);
                  field.handleChange(event.target.value);
                }}
              />
              <span>{field.state.meta.errors.flat().join(', ')}</span>
            </label>
          )}
        </form.Field>
        <button type="submit">Check passwords</button>
      </form>
      {submitted && <p>Passwords match.</p>}
    </section>
  );
}
