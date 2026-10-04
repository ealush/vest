import { expect, it } from 'vitest';
import { FieldApi, FormApi } from '@tanstack/react-form';

import {
  createPasswordChangeValidator,
  createPasswordRelationshipAdapter,
} from './relationshipAdapter';

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

it('propagates and clears dependent errors through actual field change validators', async () => {
  const adapter = createPasswordRelationshipAdapter();
  const form = new FormApi({
    defaultValues: { password: 'old', confirm: 'old' },
    validators: { onSubmit: adapter.suite },
    onSubmit: () => {},
  });
  const unmount = form.mount();
  const report = (name: 'password' | 'confirm', errors: string[] | undefined) =>
    form.setFieldMeta(name, previous => ({
      ...previous,
      errorMap: { ...previous.errorMap, onChange: errors },
    }));
  const passwordValidator = createPasswordChangeValidator(
    adapter,
    'password',
    report,
  );
  const confirmValidator = createPasswordChangeValidator(
    adapter,
    'confirm',
    report,
  );
  const password = new FieldApi({
    form,
    name: 'password',
    validators: {
      onChangeAsync: ({ fieldApi }) =>
        passwordValidator(fieldApi.form.state.values),
    },
  });
  const confirm = new FieldApi({
    form,
    name: 'confirm',
    validators: {
      onChangeAsync: ({ fieldApi }) =>
        confirmValidator(fieldApi.form.state.values),
    },
  });
  const unmountPassword = password.mount();
  const unmountConfirm = confirm.mount();
  password.handleChange('new');
  await password.validate('change');
  expect(form.state.fieldMeta.confirm?.errors).toEqual([
    'Passwords do not match',
  ]);
  confirm.handleChange('new');
  await confirm.validate('change');
  expect(form.state.fieldMeta.confirm?.errors).toEqual([]);
  unmountConfirm();
  unmountPassword();
  unmount();
});

it('attributes remote password failures to password and cancels obsolete checks', async () => {
  const signals: AbortSignal[] = [];
  const gate = deferred();
  const adapter = createPasswordRelationshipAdapter((password, signal) => {
    signals.push(signal);
    if (password === 'old') return gate.promise;
    if (password === 'taken') throw new Error('unavailable');
  });
  const older = adapter.validateChange('password', {
    password: 'old',
    confirm: 'old',
  });
  const newer = await adapter.validateChange('password', {
    password: 'taken',
    confirm: 'taken',
  });
  expect(signals[0].aborted).toBe(true);
  expect(newer).toEqual({ password: ['Password is unavailable'] });
  gate.release();
  expect(await older).toEqual(newer);
});
