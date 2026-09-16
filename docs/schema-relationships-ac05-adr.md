# ADR: focused-run callback data and result value completeness (AC05)

Status: **accepted and implemented (breaking retype).**
Scope: `suite.changed()` / `only()` / `focus()` runs on schema suites. Full runs are unaffected.

## Decision

Focused declaration data and focused results are drafts. A full successful
run certifies complete output.

- The shared suite callback (`SuiteCallbackWithSchema`) receives
  `DraftSchemaOutput<S>` (deep-partial output). The same callback runs on
  full and focused runs, so its parameter admits everything delivered on
  every permitted invocation.
- `Suite.run` / `runStatic` / `validate` return `SuiteResult` whose
  `valid: true` arm carries complete `InferSchemaOutput<S>` in `value`.
- `FocusedMethods.run` (via `changed()` / `only()` / `focus()`) returns
  `FocusedSuiteResult` whose `valid: true` arm carries
  `DraftSchemaOutput<S>` in `value`. `valid` alone never narrows a focused
  value to complete output.
- `suite.get()` returns the draft result (last run may have been focused).
  `result.types.output` still describes the complete schema output.

## Runtime witness

`packages/vest/src/suite/__tests__/schemaContracts.output.test.ts`
(`[SC-AC05]`, 6 tests, green):

- First focused run over `{ n: toNumber, note }` with input `{ note: 'ok' }`
  delivers callback data `{ note: 'ok' }` — own property `n` **absent** —
  with `valid: true` and matching `result.value`.
- After a full run, later focused runs hydrate retained fields
  (`{ n: 42, note: 'next' }`).
- Absent optional input materializes as own `undefined` consistently
  across full output, focused output, and callback data.
- Untouched invalid parser input is never fabricated into output.
- A later full run certifies complete output; `changed([])` exposes
  declaration data without validation or witness.

## Compiler witness

`tests/consumer.fixture.ts` pattern (FU-TYPE, green on `mts`/`cts`):

```ts
const suite = create(
  data => {
    // @ts-expect-error: no output witness; number methods are unsafe
    data.n.toFixed();
    if (typeof data.n === 'number') data.n.toFixed();
    test('note', () => {});
  },
  enforce.shape({
    n: enforce.isNumeric().toNumber(),
    note: enforce.isString(),
  }),
);

const focused = suite.changed('note').run({ note: 'ok' });
if (focused.valid) {
  // @ts-expect-error: valid does not prove complete mapped output
  focused.value.n.toFixed();
  if (focused.value && typeof focused.value.n === 'number')
    focused.value.n.toFixed();
}

const full = suite.run({ n: '7', note: 'ok' });
if (full.valid) full.value.n.toFixed(); // complete: compiles
// @ts-expect-error: full input is still required
suite.run({ note: 'ok' });
```

A transformed value is not a validation witness: mapping an untouched
field (`FU-OUTPUT`) runs no validator. Provenance, validation state, and
structural completeness are separate facts. Own-property absence is
preserved versus own `undefined`; missing required properties are never
fabricated to satisfy the type.

## Alternatives considered

1. **Document draft semantics, keep full signatures (previous status).**
   Zero compat breakage but leaves the demonstrated type unsoundness
   (`data.n.toFixed()` compiles yet fails at runtime on focused runs).
   Rejected: the FU-TYPE characterization proves unsafe reads compile.
2. **Draft-typed focused callbacks and results (chosen).** Breaks focused
   consumers at compile time; migration is narrowing (`typeof`, `in`,
   `Object.hasOwn`) at each read. Preserves runtime behavior, `changed([])`
   and skip-all semantics, retained hydration, and the full-run
   `valid`/`value` guarantee.
3. **Withhold `value`/callback data on incomplete runs.** Changes runtime
   behavior relied upon for declaration data; breaks `changed([])` and
   progressive hydration. Rejected.

## Compatibility impact and migration

- Schema callbacks that assumed complete output now see optional fields.
  Replace `enforce.isString().test(data.foo)` with
  `enforce(data.foo).isString()`, wrap direct reads
  (`data.foo.length`, `data.profile.age`) in `typeof` narrowing or
  optional chaining (`data.profile?.age`).
- Focused `value` reads need the same narrowing; full-run `value` after
  `if (result.valid)` is unchanged.
- `suite.get()` is now draft-typed; narrow before reading output fields.
- No `any` / `never` casts / non-null assertions were used for the retype.
  Minimum TypeScript remains 5.4.5 (verified with 5.9.3 and 5.4.5
  consumer fixtures).

Unreported changes to retained fields remain caller invalidation
responsibility in all options; no deep-diff semantics are proposed.
