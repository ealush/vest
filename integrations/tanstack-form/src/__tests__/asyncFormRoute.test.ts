import { FormApi } from '@tanstack/react-form';
import { create, enforce, mode, Modes, test } from 'vest';
import { describe, expect, it, vi } from 'vitest';

// AC08: a REAL awaited async form-validator route at the form boundary.
//
// The vest suite is passed directly as `onChangeAsync` / `onBlurAsync`
// Standard Schema validators on a headless mounted FormApi. Every validation
// below is driven through the public form API (`validate('change' | 'blur')`,
// `handleSubmit`, `setFieldValue`) with controlled deferred promises — no
// wall-clock sleeps — and asserts FORM field error state (`fieldMeta`,
// `isValid`, submit callbacks), never just internal suite state.
//
// Ownership policies pinned here (actual behavior, not wishlist):
// - In-flight async runs are never cancelled by newer runs, by `reset()`, or
//   by `unmount()`: whoever finishes last owns the error map entry.
// - TanStack aborts only validators that have not started yet (same error-map
//   key, debounce window). Once a vest run has started, its verdict lands.
// - A vest suite instance cannot run two overlapping `~standard.validate`
//   calls: the later run hijacks shared runner state and the earlier promise
//   adopts the later outcome. Overlapping same-instance runs are therefore
//   only exercised with the same value/gate (coherent) or across separate
//   suite instances / forms (isolated). See the isolation tests.
// - A rejected availability gate inside an async test is converted by vest
//   into a plain test failure carrying the RULE message (the service error
//   text never reaches the form). Rejecting a gate nobody awaits yet is an
//   unhandled rejection, so every rejection below happens after the validator
//   demonstrably started awaiting that gate.

type AsyncFormValues = {
  email: string;
  profile: { name: string };
};

const TAKEN_MESSAGE = 'Name is already taken';

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

type Gate = ReturnType<typeof deferred<boolean>>;

const tick = () =>
  new Promise<void>(resolve => {
    setImmediate(resolve);
  });

// Bounded macrotask polling (no wall-clock sleeps): waits until vest's
// deferred test body actually starts awaiting a gate.
async function pollFor(
  condition: () => boolean,
  label: string,
  cap = 500,
): Promise<void> {
  for (let i = 0; i < cap; i += 1) {
    if (condition()) {
      return;
    }
    await tick();
  }
  throw new Error(`Timed out waiting for ${label}`);
}

// Safety net only: fails loudly instead of hanging on vitest's test timeout
// if overlapping runs ever stop settling.
async function withSafetyTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Safety timeout: ${label}`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

function buildSchema() {
  // No value transforms on purpose: the schema parse is the identity, so the
  // payload TanStack forwards to onSubmit (raw form values) equals vest's
  // parsed output. (Documented gap: TanStack forwards raw values, not
  // vest-parsed output; they coincide here.)
  return enforce.shape({
    email: enforce.isString(),
    profile: enforce.shape({ name: enforce.isString() }),
  });
}

function createGatedSuite(
  gates: Map<string, Gate>,
  calls: string[],
  schema: ReturnType<typeof buildSchema>,
) {
  return create((data: AsyncFormValues) => {
    mode(Modes.ALL);
    test('email', 'Enter an email address', () => {
      calls.push('email');
      enforce(data.email).matches(/@/);
    });
    test('profile.name', TAKEN_MESSAGE, async () => {
      calls.push('profile.name:start');
      const gate = gates.get(data.profile.name);
      const available = gate ? await gate.promise : true;
      calls.push('profile.name:settled');
      enforce(available).isTruthy();
    });
  }, schema);
}

function createAsyncForm(
  defaultValues: AsyncFormValues,
  schema: ReturnType<typeof buildSchema>,
) {
  const gates = new Map<string, Gate>();
  const calls: string[] = [];
  // Separate suite instances per validation key: overlapping change/blur
  // runs must not share one instance's runner state.
  const editSuite = createGatedSuite(gates, calls, schema);
  const blurSuite = createGatedSuite(gates, calls, schema);
  const onSubmit = vi.fn();
  const onSubmitInvalid = vi.fn();
  const form = new FormApi({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
    onSubmitInvalid: () => {
      onSubmitInvalid();
    },
    validators: {
      onChangeAsync: editSuite,
      onBlurAsync: blurSuite,
    },
  });
  return {
    blurSuite,
    calls,
    editSuite,
    form,
    gates,
    onSubmit,
    onSubmitInvalid,
    setNameQuiet(name: string) {
      form.setFieldValue('profile.name', name, { dontValidate: true });
    },
  };
}

type TestForm = ReturnType<typeof createAsyncForm>['form'];

function isFormValidating(form: TestForm): boolean {
  const state = form.state as unknown as { isFormValidating?: boolean };
  return state.isFormValidating === true;
}

type FieldMetaView = {
  errors: Array<{ message?: unknown; path?: unknown } | string>;
  errorMap: Record<string, unknown>;
  errorSourceMap: Record<string, unknown>;
  isValid: boolean;
};

function fieldMetaOf(
  form: TestForm,
  field: 'email' | 'profile.name',
): FieldMetaView | undefined {
  const state = form.state as unknown as {
    fieldMeta: Record<string, unknown>;
  };
  return state.fieldMeta[field] as FieldMetaView | undefined;
}

function expectTakenIssue(error: unknown) {
  expect(error).toMatchObject({
    message: TAKEN_MESSAGE,
    path: ['profile', 'name'],
  });
}

const validValues: AsyncFormValues = {
  email: 'dev@example.com',
  profile: { name: 'Ada' },
};

const takenValues: AsyncFormValues = {
  email: 'dev@example.com',
  profile: { name: 'Taken' },
};

describe('Vest with TanStack Form: real async form-validator route (AC08)', () => {
  it('shows a pending edit in form state, then surfaces the async failure as a form field error', async () => {
    const fx = createAsyncForm(takenValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      const gate = deferred<boolean>();
      fx.gates.set('Taken', gate);

      let settled = false;
      const pending = Promise.resolve(fx.form.validate('change')).then(
        result => {
          settled = true;
          return result;
        },
      );
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'edit validator start',
      );
      // The async route is genuinely engaged: the validate() promise is still
      // open and the form reports itself as validating.
      expect(settled).toBe(false);
      expect(isFormValidating(fx.form)).toBe(true);

      gate.resolve(false);
      await pending;
      await tick();

      const meta = fieldMetaOf(fx.form, 'profile.name');
      expect(meta?.isValid).toBe(false);
      expect(meta?.errors).toHaveLength(1);
      expectTakenIssue(meta?.errors[0]);
      expect(meta?.errorMap.onChange).toBeDefined();
      expect(meta?.errorSourceMap.onChange).toBe('form');
      expect(fx.form.state.isValid).toBe(false);
      expect(isFormValidating(fx.form)).toBe(false);
      expect(fx.onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('blocks submission while the async submit validator fails', async () => {
    const fx = createAsyncForm(takenValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      const gate = deferred<boolean>();
      fx.gates.set('Taken', gate);

      const submitted = fx.form.handleSubmit();
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'submit validator start',
      );
      gate.resolve(false);
      await submitted;
      await tick();

      // Submit runs both the change and blur async validators, so the same
      // failure is recorded under both keys.
      expect(fx.onSubmit).not.toHaveBeenCalled();
      expect(fx.onSubmitInvalid).toHaveBeenCalledTimes(1);
      expect(fx.form.state.isValid).toBe(false);
      const meta = fieldMetaOf(fx.form, 'profile.name');
      expect(meta?.errors).toHaveLength(2);
      expectTakenIssue(meta?.errors[0]);
      expectTakenIssue(meta?.errors[1]);
      expect(meta?.errorMap.onChange).toBeDefined();
      expect(meta?.errorMap.onBlur).toBeDefined();
    } finally {
      unmount();
    }
  });

  it('clears the async failure per validation key as later edits validate clean', async () => {
    const fx = createAsyncForm(takenValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      fx.gates.set('Taken', deferred<boolean>());
      const blocked = fx.form.handleSubmit();
      fx.gates.get('Taken')?.resolve(false);
      await blocked;
      await tick();
      expect(fx.form.state.isValid).toBe(false);

      // A clean change edit clears only the onChange key; the stale onBlur
      // verdict still blocks the form.
      fx.setNameQuiet('Ada');
      fx.gates.set('Ada', deferred<boolean>());
      const changeEdit = fx.form.validate('change');
      fx.gates.get('Ada')?.resolve(true);
      await changeEdit;
      await tick();
      const afterChange = fieldMetaOf(fx.form, 'profile.name');
      expect(afterChange?.errorMap.onChange).toBeUndefined();
      expect(afterChange?.errorMap.onBlur).toBeDefined();
      expect(afterChange?.errors).toHaveLength(1);
      expect(fx.form.state.isValid).toBe(false);

      // A clean blur validation clears the remaining key.
      fx.gates.set('Ada', deferred<boolean>());
      const blurEdit = fx.form.validate('blur');
      fx.gates.get('Ada')?.resolve(true);
      await blurEdit;
      await tick();
      expect(fieldMetaOf(fx.form, 'profile.name')?.errors).toEqual([]);
      expect(fx.form.state.isValid).toBe(true);
    } finally {
      unmount();
    }
  });

  it('emits the parsed payload exactly once on a fully valid async submit', async () => {
    const fx = createAsyncForm(validValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      const gate = deferred<boolean>();
      fx.gates.set('Ada', gate);

      const submitted = fx.form.handleSubmit();
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'submit validator start',
      );
      gate.resolve(true);
      await submitted;
      await tick();

      expect(fx.onSubmit).toHaveBeenCalledTimes(1);
      expect(fx.onSubmit).toHaveBeenCalledWith(validValues);
      expect(fx.onSubmitInvalid).not.toHaveBeenCalled();
      expect(fx.form.state.isValid).toBe(true);
      expect(fx.form.state.isSubmitSuccessful).toBe(true);

      // The schema parse is the identity here, so the submitted payload is
      // vest's parsed output.
      const standard = await fx.editSuite['~standard'].validate(validValues);
      expect(standard).toEqual({ value: validValues });
    } finally {
      unmount();
    }
  });

  it('submit-while-edit-pending: the last run to finish owns the verdict (pinned)', async () => {
    const fx = createAsyncForm(takenValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      const gate = deferred<boolean>();
      fx.gates.set('Taken', gate);

      let editSettled = false;
      const edit = Promise.resolve(fx.form.validate('change')).then(result => {
        editSettled = true;
        return result;
      });
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'edit validator start',
      );

      // Submit while the edit run is still in flight. TanStack aborts only
      // validators that have not started yet, so the in-flight edit run keeps
      // awaiting the same gate; both runs share the value and the gate, and
      // the last finish wins. Either order settles invalid here.
      const submitted = fx.form.handleSubmit();
      gate.resolve(false);
      await withSafetyTimeout(
        Promise.all([edit, submitted]),
        2000,
        'edit + submit settling',
      );
      await tick();

      expect(editSettled).toBe(true);
      expect(fx.form.state.isSubmitting).toBe(false);
      expect(fx.onSubmit).not.toHaveBeenCalled();
      expect(fx.onSubmitInvalid).toHaveBeenCalledTimes(1);
      expect(
        fieldMetaOf(fx.form, 'profile.name')?.errors?.length,
      ).toBeGreaterThan(0);
      expect(fx.form.state.isValid).toBe(false);
    } finally {
      unmount();
    }
  });

  it('a rejected stale run after a newer valid run fails only its own form (no unhandled rejection)', async () => {
    const schema = buildSchema();
    const stale = createAsyncForm(takenValues, schema);
    const newer = createAsyncForm(validValues, schema);
    const unmountStale = stale.form.mount();
    const unmountNewer = newer.form.mount();
    try {
      const takenGate = deferred<boolean>();
      stale.gates.set('Taken', takenGate);
      const adaGate = deferred<boolean>();
      newer.gates.set('Ada', adaGate);

      const staleRun = Promise.resolve(stale.form.validate('change'));
      await pollFor(
        () => stale.calls.includes('profile.name:start'),
        'stale run start',
      );
      const newerRun = Promise.resolve(newer.form.validate('change'));
      await pollFor(
        () => newer.calls.includes('profile.name:start'),
        'newer run start',
      );

      // The newer valid run completes first.
      adaGate.resolve(true);
      await newerRun;
      await tick();
      expect(fieldMetaOf(newer.form, 'profile.name')?.errors ?? []).toEqual([]);
      expect(newer.form.state.isValid).toBe(true);

      // The stale run rejects after that. The gate IS being awaited, so this
      // is a handled rejection; vest converts the throw into a plain test
      // failure carrying the rule message (the service error text never
      // reaches the form boundary).
      takenGate.reject(new Error('availability service down'));
      await staleRun;
      await tick();

      expect(stale.calls).not.toContain('profile.name:settled');
      const staleMeta = fieldMetaOf(stale.form, 'profile.name');
      expect(staleMeta?.errors).toHaveLength(1);
      expectTakenIssue(staleMeta?.errors[0]);
      expect(stale.form.state.isValid).toBe(false);

      // The newer form is untouched by the stale failure and still submits.
      await newer.form.handleSubmit();
      expect(newer.onSubmit).toHaveBeenCalledTimes(1);
      expect(newer.onSubmit).toHaveBeenCalledWith(validValues);
      expect(stale.onSubmit).not.toHaveBeenCalled();
    } finally {
      unmountStale();
      unmountNewer();
    }
  });

  it('an invalid stale resolve after a newer valid run lands only on its own form', async () => {
    const schema = buildSchema();
    const stale = createAsyncForm(takenValues, schema);
    const newer = createAsyncForm(validValues, schema);
    const unmountStale = stale.form.mount();
    const unmountNewer = newer.form.mount();
    try {
      const takenGate = deferred<boolean>();
      stale.gates.set('Taken', takenGate);
      const adaGate = deferred<boolean>();
      newer.gates.set('Ada', adaGate);

      const staleRun = Promise.resolve(stale.form.validate('change'));
      await pollFor(
        () => stale.calls.includes('profile.name:start'),
        'stale run start',
      );
      const newerRun = Promise.resolve(newer.form.validate('change'));
      await pollFor(
        () => newer.calls.includes('profile.name:start'),
        'newer run start',
      );

      adaGate.resolve(true);
      await newerRun;
      expect(newer.form.state.isValid).toBe(true);

      // Last finish wins, scoped to the stale form only.
      takenGate.resolve(false);
      await staleRun;
      await tick();

      expect(stale.calls).toContain('profile.name:settled');
      expect(stale.form.state.isValid).toBe(false);
      expectTakenIssue(fieldMetaOf(stale.form, 'profile.name')?.errors[0]);
      expect(newer.form.state.isValid).toBe(true);
      expect(fieldMetaOf(newer.form, 'profile.name')?.errors ?? []).toEqual([]);

      const blocked = stale.form.handleSubmit();
      await blocked;
      expect(stale.onSubmit).not.toHaveBeenCalled();
      expect(stale.onSubmitInvalid).toHaveBeenCalledTimes(1);
    } finally {
      unmountStale();
      unmountNewer();
    }
  });

  it('unmount while pending does not cancel the in-flight run', async () => {
    const fx = createAsyncForm(takenValues, buildSchema());
    const unmount = fx.form.mount();
    let unmounted = false;
    try {
      const gate = deferred<boolean>();
      fx.gates.set('Taken', gate);

      const pending = Promise.resolve(fx.form.validate('change'));
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'edit validator start',
      );

      unmount();
      unmounted = true;
      gate.resolve(false);
      await pending;
      await tick();

      // The verdict still lands in form state after unmount; nothing was
      // submitted and nothing threw.
      const meta = fieldMetaOf(fx.form, 'profile.name');
      expect(meta?.errors).toHaveLength(1);
      expectTakenIssue(meta?.errors[0]);
      expect(fx.form.state.isValid).toBe(false);
      expect(fx.onSubmit).not.toHaveBeenCalled();
    } finally {
      if (!unmounted) {
        unmount();
      }
    }
  });

  it('reset while pending does not cancel the in-flight run; the stale verdict re-populates', async () => {
    const fx = createAsyncForm(validValues, buildSchema());
    const unmount = fx.form.mount();
    try {
      fx.setNameQuiet('Taken');
      const gate = deferred<boolean>();
      fx.gates.set('Taken', gate);

      const pending = Promise.resolve(fx.form.validate('change'));
      await pollFor(
        () => fx.calls.includes('profile.name:start'),
        'edit validator start',
      );

      fx.form.reset();
      expect(fx.form.state.values).toEqual(validValues);
      // Reset restores values and clears the recorded errors (the meta entry
      // itself is retained).
      expect(fieldMetaOf(fx.form, 'profile.name')?.errors ?? []).toEqual([]);

      // The stale run was validated against the pre-reset value and still
      // owns the last finish: values stay reset, but the error reappears.
      gate.resolve(false);
      await pending;
      await tick();

      expect(fx.form.state.values).toEqual(validValues);
      expect(fx.form.state.isValid).toBe(false);
      expectTakenIssue(fieldMetaOf(fx.form, 'profile.name')?.errors[0]);

      // Recovery is one fresh clean validation away.
      fx.gates.set('Ada', deferred<boolean>());
      const recovery = fx.form.validate('change');
      fx.gates.get('Ada')?.resolve(true);
      await recovery;
      await tick();
      expect(fieldMetaOf(fx.form, 'profile.name')?.errors).toEqual([]);
      expect(fx.form.state.isValid).toBe(true);
    } finally {
      unmount();
    }
  });

  it('two forms sharing one schema stay isolated across pending runs, unmount, and submit', async () => {
    const schema = buildSchema();
    const invalidForm = createAsyncForm(takenValues, schema);
    const validForm = createAsyncForm(validValues, schema);
    const unmountInvalid = invalidForm.form.mount();
    const unmountValid = validForm.form.mount();
    try {
      const takenGate = deferred<boolean>();
      invalidForm.gates.set('Taken', takenGate);
      const adaGate = deferred<boolean>();
      validForm.gates.set('Ada', adaGate);

      // Overlapping pendings on separate instances never share runner state.
      const invalidRun = Promise.resolve(invalidForm.form.validate('change'));
      const validRun = Promise.resolve(validForm.form.validate('change'));
      await pollFor(
        () => invalidForm.calls.includes('profile.name:start'),
        'invalid run start',
      );
      await pollFor(
        () => validForm.calls.includes('profile.name:start'),
        'valid run start',
      );

      adaGate.resolve(true);
      takenGate.resolve(false);
      await Promise.all([invalidRun, validRun]);
      await tick();

      expect(invalidForm.form.state.isValid).toBe(false);
      expectTakenIssue(
        fieldMetaOf(invalidForm.form, 'profile.name')?.errors[0],
      );
      expect(validForm.form.state.isValid).toBe(true);
      expect(fieldMetaOf(validForm.form, 'profile.name')?.errors ?? []).toEqual(
        [],
      );

      // Unmounting the invalid form changes nothing about the valid one.
      unmountInvalid();
      expect(validForm.form.state.isValid).toBe(true);
      await validForm.form.handleSubmit();
      expect(validForm.onSubmit).toHaveBeenCalledTimes(1);
      expect(validForm.onSubmit).toHaveBeenCalledWith(validValues);
      expect(invalidForm.onSubmit).not.toHaveBeenCalled();
    } finally {
      unmountValid();
    }
  });
});

describe('Vest with TanStack Form: array field paths (AC08)', () => {
  type ArrayValues = { travelers: { passport: string }[] };

  function createArrayForm() {
    const gates = new Map<string, Gate>();
    const calls: string[] = [];
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(
        enforce.shape({ passport: enforce.isString() }),
      ),
    });
    const makeSuite = () =>
      create((data: ArrayValues) => {
        mode(Modes.ALL);
        data.travelers.forEach((row, index) => {
          test(`travelers.${index}.passport`, TAKEN_MESSAGE, async () => {
            calls.push(`travelers.${index}.passport:start`);
            const gate = gates.get(row.passport);
            const available = gate ? await gate.promise : true;
            calls.push(`travelers.${index}.passport:settled`);
            enforce(available).isTruthy();
          });
        });
      }, schema);
    const onSubmit = vi.fn();
    const onSubmitInvalid = vi.fn();
    const form = new FormApi({
      defaultValues: { travelers: [{ passport: 'Taken' }] },
      onSubmit: ({ value }) => {
        onSubmit(value);
      },
      onSubmitInvalid: () => {
        onSubmitInvalid();
      },
      validators: { onChangeAsync: makeSuite(), onBlurAsync: makeSuite() },
    });
    return { calls, form, gates, onSubmit, onSubmitInvalid };
  }

  function arrayFieldMetaOf(
    form: { state: unknown },
    field: string,
  ): FieldMetaView | undefined {
    const state = form.state as unknown as {
      fieldMeta: Record<string, unknown>;
    };
    return state.fieldMeta[field] as FieldMetaView | undefined;
  }

  it('async failure on an array item path surfaces in form field state and blocks submit', async () => {
    const fx = createArrayForm();
    const unmount = fx.form.mount();
    try {
      fx.gates.set('Taken', deferred<boolean>());
      const submitted = fx.form.handleSubmit();
      await pollFor(
        () => fx.calls.includes('travelers.0.passport:start'),
        'array item validator start',
      );
      fx.gates.get('Taken')?.resolve(false);
      await submitted;
      await tick();
      const meta = arrayFieldMetaOf(fx.form, 'travelers[0].passport');
      expect(meta?.isValid).toBe(false);
      // Submit runs both the change and blur async validators, so the
      // same failure is reported once per validation key.
      expect(meta?.errors).toHaveLength(2);
      for (const error of meta?.errors ?? []) {
        expect(error).toMatchObject({
          message: TAKEN_MESSAGE,
          path: ['travelers', '0', 'passport'],
        });
      }
      expect(fx.onSubmit).not.toHaveBeenCalled();
      expect(fx.onSubmitInvalid).toHaveBeenCalledTimes(1);

      // A clean value at the same array path clears the onChange key;
      // the stale onBlur verdict still blocks, exactly like scalar paths.
      fx.form.setFieldValue('travelers[0].passport', 'Ada', {
        dontValidate: true,
      });
      fx.gates.set('Ada', deferred<boolean>());
      const changeEdit = fx.form.validate('change');
      fx.gates.get('Ada')?.resolve(true);
      await changeEdit;
      await tick();
      const afterChange = arrayFieldMetaOf(fx.form, 'travelers[0].passport');
      expect(afterChange?.errorMap.onChange).toBeUndefined();
      expect(afterChange?.errorMap.onBlur).toBeDefined();
      expect(fx.form.state.isValid).toBe(false);

      // A clean blur validation clears the remaining key.
      fx.gates.set('Ada', deferred<boolean>());
      const blurEdit = fx.form.validate('blur');
      fx.gates.get('Ada')?.resolve(true);
      await blurEdit;
      await tick();
      expect(
        arrayFieldMetaOf(fx.form, 'travelers[0].passport')?.errors,
      ).toEqual([]);
      expect(fx.form.state.isValid).toBe(true);
    } finally {
      unmount();
    }
  });
});
