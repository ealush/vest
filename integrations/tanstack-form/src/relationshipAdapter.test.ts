import { expect, it } from 'vitest';
import { FormApi } from '@tanstack/react-form';

import { createPasswordRelationshipAdapter } from './relationshipAdapter';

function deferred() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

it('revalidates the confirmation when its password changes', async () => {
  const adapter = createPasswordRelationshipAdapter();
  const errors = await adapter.validateChange('password', {
    password: 'new',
    confirm: 'old',
  });

  expect(errors).toEqual({ confirm: ['Passwords do not match'] });
  expect(adapter.suite.get().run.focus?.only).toEqual(['password', 'confirm']);
  expect(
    await adapter.validateChange('confirm', {
      password: 'new',
      confirm: 'new',
    }),
  ).toEqual({});
});

it('applies dependent errors to the TanStack Form field', async () => {
  const adapter = createPasswordRelationshipAdapter();
  const form = new FormApi({
    defaultValues: { password: 'old', confirm: 'old' },
    onSubmit: () => {},
    validators: { onSubmit: adapter.suite },
  });
  const unmount = form.mount();

  form.setFieldValue('password', 'new');
  const errors = await adapter.validateChange('password', form.state.values);
  form.setFieldMeta('confirm', previous => ({
    ...previous,
    errorMap: { ...previous?.errorMap, onChange: errors.confirm },
  }));

  expect(form.state.fieldMeta.confirm?.errors).toEqual([
    'Passwords do not match',
  ]);
  unmount();
});

it('settles an older pending change with the newer run outcome', async () => {
  const gate = deferred();
  const adapter = createPasswordRelationshipAdapter(password =>
    password === 'old' ? gate.promise : undefined,
  );

  const older = adapter.validateChange('password', {
    password: 'old',
    confirm: 'wrong',
  });
  const newer = adapter.validateChange('password', {
    password: 'new',
    confirm: 'new',
  });
  const current = await newer;
  gate.release();

  expect(current).toEqual({});
  expect(await older).toEqual(current);
  expect(adapter.suite.get().hasErrors('confirm')).toBe(false);
});

it('keeps each adapter instance and Standard Schema submission independent', async () => {
  const first = createPasswordRelationshipAdapter();
  const second = createPasswordRelationshipAdapter();
  await first.validateChange('password', {
    password: 'a',
    confirm: 'b',
  });

  expect(first.suite.get().hasErrors('confirm')).toBe(true);
  expect(second.suite.get().hasErrors('confirm')).toBe(false);
  expect(
    await second.suite['~standard'].validate({
      password: 'a',
      confirm: 'a',
    }),
  ).toEqual({ value: { password: 'a', confirm: 'a' } });
});
