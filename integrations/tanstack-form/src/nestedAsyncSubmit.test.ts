import { FormApi } from '@tanstack/react-form';
import { create, enforce, mode, Modes, test } from 'vest';
import { describe, expect, it, vi } from 'vitest';

type FieldMetaView = {
  errors: Array<{ message?: unknown; path?: unknown } | string>;
  isValid: boolean;
};

function fieldMetaOf(
  form: { state: unknown },
  field: 'email' | 'profile.name',
): FieldMetaView | undefined {
  const state = form.state as unknown as {
    fieldMeta: Record<string, unknown>;
  };
  return state.fieldMeta[field] as FieldMetaView | undefined;
}

// Bounded macrotask polling (no wall-clock sleeps): waits until the
// debounced async validator actually starts its focused run.
async function pollFor(condition: () => boolean, what: string) {
  for (let i = 0; i < 100 && !condition(); i += 1) {
    await new Promise<void>(resolve => {
      setImmediate(resolve);
    });
  }
  if (!condition()) throw new Error(`timed out waiting for ${what}`);
}

// IN04b: nested async field validation plus submit through a real mounted
// TanStack form.
//
// Scope note (tracked, not a silent downgrade): TanStack Form's Standard
// Schema submit path is synchronous (`async function passed to sync
// validator` if the submit suite contains pending async tests), so the
// adapter awaits nested async work on change (async validator) and
// full-validates synchronously on submit. This test pins that documented
// split: a nested async onChangeAsync validator settles its failure into
// form field state (blocking submit), and a sync submit suite still
// full-validates the payload.
describe('Vest with TanStack Form: nested async edit with sync submit (IN04b)', () => {
  it('settles a nested async edit into form field state and blocks submit', async () => {
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

    const editSuite = create(data => {
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
    }, schema);
    const submitSuite = create(data => {
      mode(Modes.ALL);
      test('email', 'Enter an email address', () => {
        enforce(data.email).matches(/@/);
      });
      test('profile.name', 'Enter a name', () => {
        enforce(data.profile?.name).isNotBlank();
      });
    }, schema);

    const form = new FormApi({
      defaultValues: { email: 'dev@example.com', profile: { name: 'Ada' } },
      onSubmit: ({ value }) => {
        onSubmit(value);
      },
      validators: {
        // Async by design: the validator awaits the focused run so the
        // settled verdict — not the still-pending snapshot — reaches form
        // field state. A sync wrapper would return before settlement and
        // swallow the async failure.
        onChangeAsync: async ({ value }) => {
          const result = await editSuite.changed('profile.name').run(value);
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
      // Async validators debounce: wait until the focused run actually
      // starts instead of assuming one flush is enough.
      await pollFor(
        () => calls.mock.calls.some(args => args[0] === 'profile.name'),
        'edit validator start',
      );
      expect(editSuite.get().isPending()).toBe(true);

      release(false);
      await pending;
      await flush();
      await flush();
      expect(editSuite.get().hasErrors('profile.name')).toBe(true);

      // The settled failure is form state, not just suite state.
      const meta = fieldMetaOf(form, 'profile.name');
      expect(meta?.isValid).toBe(false);
      expect(form.state.isValid).toBe(false);

      // Submit stays blocked while the async failure stands: the sync
      // submit suite cannot overrule settled field errors.
      await form.handleSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
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
