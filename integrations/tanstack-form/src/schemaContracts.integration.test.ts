import { FormApi } from '@tanstack/react-form';
import { create, enforce, mode, Modes, test } from 'vest';
import { describe, expect, it, vi } from 'vitest';

type Values = { password: string; confirm: string; note: string };

// A test adapter supplies the event's changed name. Submit always invokes the
// public Standard Schema surface on the complete payload.
function fixture(defaultValues: Values) {
  const calls = vi.fn();
  const onSubmit = vi.fn();
  const suite = create(
    data => {
      mode(Modes.ALL);
      test('password', () => {
        calls('password');
        enforce(data.password).isNotBlank();
      });
      test('confirm', 'Passwords must match', () => {
        calls('confirm');
        enforce(data.confirm).equals(data.password);
      });
      test('note', 'Note required', () => {
        calls('note');
        enforce(data.note).isNotBlank();
      });
    },
    enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
      note: enforce.isString(),
    }),
  );
  let changed: keyof Values | undefined;
  const form = new FormApi({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
    validators: {
      onChange: ({ value }) => {
        const result =
          changed === undefined
            ? suite.run(value)
            : suite.changed(changed).run(value);
        return result.hasErrors() ? { fields: result.getErrors() } : undefined;
      },
      onSubmit: suite,
    },
  });
  return {
    calls,
    async edit(field: keyof Values, value: string) {
      changed = field;
      form.setFieldValue(field, value, { dontValidate: true });
      await form.validate('change');
    },
    form,
    onSubmit,
    suite,
  };
}

describe('schema contracts: real TanStack Form lifecycle', () => {
  it('[SC-FORM] source edits publish dependent errors, retain unrelated errors, and repair before submit', async () => {
    const { form, edit, calls, onSubmit } = fixture({
      password: 'old',
      confirm: 'old',
      note: '',
    });
    const unmount = form.mount();
    try {
      await form.validate('change');
      calls.mockClear();
      await edit('password', 'new');
      expect(calls.mock.calls.map(([field]) => field)).toEqual([
        'password',
        'confirm',
      ]);
      expect(form.state.fieldMeta.confirm?.errors).toContain(
        'Passwords must match',
      );
      expect(form.state.fieldMeta.note?.errors).toContain('Note required');
      await form.handleSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      await edit('confirm', 'new');
      await edit('note', 'ready');
      expect(form.state.fieldMeta.confirm?.errors).toEqual([]);
      expect(form.state.fieldMeta.note?.errors).toEqual([]);
      await form.handleSubmit();
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        password: 'new',
        confirm: 'new',
        note: 'ready',
      });
    } finally {
      unmount();
    }
  });

  it('[SC-FORM] a fresh focused pass cannot bypass full submit validation', async () => {
    const { form, edit, suite, onSubmit } = fixture({
      password: 'same',
      confirm: 'same',
      note: '',
    });
    const unmount = form.mount();
    try {
      await edit('password', 'same');
      expect(suite.get().isTested('note')).toBe(false);
      expect(suite.get().hasErrors()).toBe(false);
      await form.handleSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(form.state.fieldMeta.note?.errors).toContainEqual(
        expect.objectContaining({ message: 'Note required', path: ['note'] }),
      );
    } finally {
      unmount();
    }
  });

  it('[SC-FORM] separate mounted forms never share retained dependency errors', async () => {
    const a = fixture({ password: 'old', confirm: 'old', note: 'ok' });
    const b = fixture({ password: 'same', confirm: 'same', note: 'ok' });
    const unmountA = a.form.mount();
    const unmountB = b.form.mount();
    try {
      await Promise.all([
        a.edit('password', 'new'),
        b.edit('password', 'same'),
      ]);
      expect(a.form.state.fieldMeta.confirm?.errors).toContain(
        'Passwords must match',
      );
      expect(b.form.state.isValid).toBe(true);
      await b.form.handleSubmit();
      expect(b.onSubmit).toHaveBeenCalledTimes(1);
      expect(a.form.state.isValid).toBe(false);
    } finally {
      unmountA();
      unmountB();
    }
  });
});
