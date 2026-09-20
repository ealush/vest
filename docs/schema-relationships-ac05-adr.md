# ADR: focused-run callback data and result value completeness (AC05)

Status: **Vest 6 compatibility decision accepted; sound retype deferred to
Vest 7.** Tracked by [#1327](https://github.com/ealush/vest/issues/1327).

Scope: `suite.changed()` / `only()` / `focus()` runs on schema suites.

## Vest 6 decision

Schema relationships ship without changing the established types of
`create()`, its callback, `suite.get()`, `only()`, or `focus()`.

- `SuiteCallbackWithSchema` continues to receive the complete
  `InferSchemaOutput<S>` type.
- `Suite.run`, `runStatic`, and `validate` return `SuiteResult`, whose
  `valid: true` arm carries complete `InferSchemaOutput<S>` in `value`.
- Existing `only()` and `focus()` chains continue returning `SuiteResult`.
- The new `changed()` chain returns `FocusedSuiteResult`; its `valid: true`
  arm carries `DraftSchemaOutput<S>` because only the affected region is
  certified.
- `suite.get()` retains its Vest 6 `SuiteResult` type.
- `DeepDraft`, `DraftSchemaOutput`, and `FocusedSuiteResult` are additive
  exports for consumers of `changed()`.

This preserves source compatibility. It also deliberately preserves an
existing type-system limitation: one suite callback is used by both full and
focused runs, so its complete-output type can overstate data delivered by a
focused invocation. The same limitation already exists for `only()` and
`focus()`. Correcting it is a major-release change, not a requirement for the
new invalidation graph.

## Runtime contract

- A first focused run may omit untouched required properties.
- A later focused run can hydrate untouched properties from the last successful
  mapped output.
- Absent optional input can materialize as an own `undefined` property.
- Untouched invalid parser input is never fabricated into output.
- A later full run certifies complete output.
- `changed([])` executes no fields and establishes no validation witness.

These behaviors are covered by the `[SC-AC05]` tests in
`packages/vest/src/suite/__tests__/schemaContracts.output.test.ts`.

## Vest 6 compiler contract

```ts
const suite = create(
  data => {
    // Preserved Vest 6 callback type. Runtime focused calls can still require
    // defensive access; #1327 makes that requirement explicit in Vest 7.
    data.n.toFixed();
  },
  enforce.shape({
    n: enforce.isNumeric().toNumber(),
    note: enforce.isString(),
  }),
);

const focused = suite.changed('note').run({ note: 'ok' });
if (focused.valid && typeof focused.value?.n === 'number') {
  focused.value.n.toFixed();
}

const full = suite.run({ n: '7', note: 'ok' });
if (full.valid) full.value.n.toFixed();
```

Packed ESM and CJS consumer fixtures pin both sides of this compromise: legacy
callback and focused-method reads continue compiling, while new `changed()`
result reads require narrowing.

## Vest 7 target

Issue [#1327](https://github.com/ealush/vest/issues/1327) records the complete
solution already validated during development:

- type the shared callback as `DraftSchemaOutput<S>`;
- return `FocusedSuiteResult` from `only()`, `focus()`, and `suite.get()`;
- preserve complete results for full `run()`, `runStatic()`, and `validate()`;
- retain atomic container behavior in `DeepDraft`; and
- preserve callback trailing-argument types instead of widening them.

The issue includes migration guidance and acceptance criteria so the soundness
fix can ship intentionally with Vest 7.
