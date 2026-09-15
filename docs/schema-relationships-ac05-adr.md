# ADR: focused-run callback data and result value completeness (AC05)

Status: **accepted for documentation and characterization; breaking retype deferred.**
Scope: `suite.changed()` / focused runs on schema suites. Full runs are unaffected.

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

`SuiteCallbackWithSchema<S, T>` types callback data as full
`InferSchemaOutput<S>`; the `valid: true` arm of `SuiteResult` likewise
promises full output in `value`. A focused run missing a required property
therefore typechecks code (e.g. `data.n.toFixed()`) that fails at runtime.
No test currently pins the unsound assignment because the lie is in the
declared type, not in a runtime value the tests observe.

## User impact

Any consumer reading schema-only fields from focused-run callback data or
from `value` after narrowing `valid` can observe `undefined`/absence where
the type promises a required property. Full-run consumers are unaffected.

## Options

1. **Document draft semantics, keep signatures (recommended).**
   Focused callback data and result values are drafts with per-field
   provenance; only full runs certify complete output. Cost: zero compat
   breakage; the unsound type remains until option 2 or 3. Tests: the
   characterization suite above.
2. **Draft-typed focused callbacks** (e.g. per-field optional output).
   Breaks every focused consumer's compilation; migration requires
   narrowing or non-null assertions at each read. Rejected for this patch:
   broad, unrequested breakage for a contract the runtime already
   describes honestly in prose.
3. **Withhold `value`/callback data on incomplete runs.** Changes runtime
   behavior (currently relied upon for declaration data); breaks
   `changed([])` and progressive form hydration. Rejected: destroys
   feature semantics.

## Recommendation

Adopt option 1 now: user guide documents draft vs complete output
(`website/docs/writing_your_suite/schema_relationships.md`), the
characterization suite locks behavior, and this ADR records the deferred
breaking retype. Revisit only with a codemod-scale migration story.
Unreported changes to retained fields remain caller invalidation
responsibility in all options; no deep-diff semantics are proposed.
