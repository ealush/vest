# Schema relationships v6 compatibility design

## Goal

Ship schema relationships and `suite.changed()` as an additive Vest 6 feature
without changing the established types of `create()`, its callback, `get()`,
`only()`, or `focus()`. Track the sound draft retype explicitly for Vest 7.

## Public type contract

- `SuiteCallbackWithSchema` continues to receive `InferSchemaOutput<S>`.
- `Suite`, `suite.get()`, `suite.run()`, `runStatic()`, and `validate()` retain
  their existing signatures.
- Existing `only()` and `focus()` chains retain their existing input and result
  types.
- The new `changed()` chain accepts partial schema input and returns
  `FocusedSuiteResult`, whose successful value is `DraftSchemaOutput<S>`.
- Chaining `changed()` with `only()` or `focus()` remains draft-result typed in
  either order.
- `DeepDraft`, `DraftSchemaOutput`, and `FocusedSuiteResult` remain additive
  public exports for consumers of the new method.

The shared callback remains intentionally typed with the legacy complete-output
contract even though focused execution can supply incomplete data. This
pre-existing `only()`/`focus()` soundness gap is documented and deferred to a
Vest 7 issue rather than imposed as a breaking change in Vest 6.

## Runtime compatibility

Keep the new relationship and `changed()` behavior. Review observable changes
to existing entry points and either preserve their prior behavior or classify
them as narrow bug fixes. In particular, avoid making the new draft-result type
infect existing full-run, `get()`, `only()`, or `focus()` call sites.

## Verification

- Add compile-time fixtures proving existing schema callbacks and focused
  result reads still compile.
- Keep compile-time fixtures proving `changed()` results require draft
  narrowing.
- Run focused type tests, the schema-relationship suite, packed ESM/CJS
  consumer checks, boundary/coverage gates, and the PR CI matrix.
- Update the ADR, technical specification, public documentation, generated LLM
  docs, and PR description so none claim Vest 7 is required for this release.

## Follow-up

Create a repository issue for Vest 7 that explains the retained unsoundness,
the intended solution already implemented on this branch before the v6
compatibility adjustment, migration examples, and acceptance criteria. Record
the exact shape: `SuiteCallbackWithSchema` receives `DraftSchemaOutput<S>`,
focused methods and `suite.get()` return `FocusedSuiteResult`, full `run()` /
`runStatic()` / `validate()` retain complete `SuiteResult`, and identity-bearing
containers remain atomic within `DeepDraft`. Link the issue from the ADR and PR.
