import { describe, expect, it, vi } from 'vitest';

import { createRegistrationForm } from './integration';
import { createRegistrationIntegration } from './suite';

const validValues = {
  email: 'dev@example.com',
  profile: { name: 'Ada' },
};

describe('Vest with TanStack Form', () => {
  it('focuses change validation on the changed field', () => {
    const integration = createRegistrationIntegration();
    const errors = integration.validateField('email', {
      email: 'invalid',
      profile: { name: 'A' },
    });
    const result = integration.suite.get();

    expect(errors).toHaveLength(2);
    expect(result.isTested('email')).toBe(true);
    expect(result.isTested('profile.name')).toBe(false);
  });

  it('keeps focused retained state isolated between integration instances', () => {
    const emailIntegration = createRegistrationIntegration();
    const nameIntegration = createRegistrationIntegration();

    emailIntegration.validateField('email', {
      email: 'invalid',
      profile: { name: 'Ada' },
    });
    nameIntegration.validateField('profile.name', {
      email: 'dev@example.com',
      profile: { name: 'A' },
    });

    expect(emailIntegration.suite.get().getErrors('email')).toHaveLength(2);
    expect(emailIntegration.suite.get().isTested('profile.name')).toBe(false);
    expect(nameIntegration.suite.get().getErrors('profile.name')).toHaveLength(
      1,
    );
    expect(nameIntegration.suite.get().isTested('email')).toBe(false);
  });

  it('maps nested paths and multiple issues into form state', async () => {
    const form = createRegistrationForm({
      email: 'invalid',
      profile: { name: 'A' },
    });
    const unmount = form.mount();

    const errors = await form.validate('change');

    expect(errors['profile.name']?.onChange).toHaveLength(1);
    expect(errors.email?.onChange).toHaveLength(2);
    expect(form.state.fieldMeta.email?.errors).toHaveLength(2);
    expect(form.state.isValid).toBe(false);
    unmount();
  });

  it('clears corrected errors and submits valid values', async () => {
    const onSubmit = vi.fn();
    const form = createRegistrationForm(
      { email: 'invalid', profile: { name: 'Ada' } },
      onSubmit,
    );
    const unmount = form.mount();
    await form.validate('change');

    form.setFieldValue('email', 'dev@example.com');
    await form.validate('change');
    expect(form.state.fieldMeta.email?.errors).toEqual([]);

    await form.handleSubmit();
    expect(onSubmit).toHaveBeenCalledWith(validValues);
    unmount();
  });

  it('keeps independent form instances isolated', async () => {
    const invalid = createRegistrationForm({
      email: 'invalid',
      profile: { name: 'A' },
    });
    const valid = createRegistrationForm(validValues);
    const unmountInvalid = invalid.mount();
    const unmountValid = valid.mount();

    await Promise.all([invalid.validate('change'), valid.validate('change')]);

    expect(invalid.state.isValid).toBe(false);
    expect(valid.state.isValid).toBe(true);
    unmountInvalid();
    unmountValid();
  });
});
