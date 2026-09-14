import { FormApi } from '@tanstack/react-form';
import { create, enforce, mode, Modes, test } from 'vest';
import { describe, expect, it, vi } from 'vitest';

// IN04b: nested async field validation plus submit through a real mounted
// TanStack form.
//
// Scope note (tracked, not a silent downgrade): TanStack Form's Standard
// Schema submit path is synchronous (`async function passed to sync
// validator` if the submit suite contains pending async tests), so the
// adapter validates nested async work on change and full-validates
// synchronously on submit. This test pins that documented split: a nested
// async onChange validator settles into field state, and a sync submit
// suite still full-validates the payload.
describe('Vest with TanStack Form: nested async edit with sync submit (IN04b)', () => {
  it('settles a nested async edit and full-validates on submit', async () => {
    let release!: (available: boolean) => void;
    const gate = new Promise<boolean>(resolve => {
      release = resolve;
    });
    const flush = () =>
      new Promise<void>(resolve => {
        setImmediate(resolve);
      });
    const calls = vi.fn();
    const onSubmit = vi.fn();
    const schema = enforce.shape({
      email: enforce.isString(),
      profile: enforce.shape({ name: enforce.isString() }),
    });

    const editSuite = create(
      (data: { email: string; profile: { name: string } }) => {
        mode(Modes.ALL);
        test('email', () => {
          calls('email');
          enforce(data.email).matches(/@/);
        });
        test('profile.name', 'Name is already taken', async () => {
          calls('profile.name');
          const available = await gate;
          enforce(available).isTruthy();
        });
      },
      schema,
    );
    const submitSuite = create(
      (data: { email: string; profile: { name: string } }) => {
        mode(Modes.ALL);
        test('email', 'Enter an email address', () => {
          enforce(data.email).matches(/@/);
        });
        test('profile.name', 'Enter a name', () => {
          enforce(data.profile.name).isNotBlank();
        });
      },
      schema,
    );

    const form = new FormApi({
      defaultValues: { email: 'dev@example.com', profile: { name: 'Ada' } },
      onSubmit: ({ value }) => {
        onSubmit(value);
      },
      validators: {
        onChange: ({ value }) => {
          const result = editSuite.changed('profile.name').run(value);
          return result.hasErrors()
            ? { fields: result.getErrors() }
            : undefined;
        },
        onSubmit: submitSuite,
      },
    });
    const unmount = form.mount();
    try {
      const pending = form.validate('change');
      await flush();
      expect(editSuite.get().isPending()).toBe(true);

      release(false);
      await pending;
      await flush();
      await flush();
      expect(editSuite.get().hasErrors('profile.name')).toBe(true);

      // Sync submit full-validates the payload shape even though the edit
      // suite observed the async failure.
      await form.handleSubmit();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'dev@example.com',
        profile: { name: 'Ada' },
      });
    } finally {
      unmount();
    }
  });

  it('documents that Standard Schema submit stays synchronous', () => {
    const asyncSuite = create(() => {
      test('profile.name', async () => {});
    });
    const form = new FormApi({
      defaultValues: { email: 'x', profile: { name: 'y' } },
      validators: { onSubmit: asyncSuite },
    });
    const unmount = form.mount();
    try {
      expect(() => form.validateSync('submit')).toThrow(
        /async function passed to sync validator/,
      );
    } finally {
      unmount();
    }
  });
});
