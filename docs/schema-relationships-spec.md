# Schema relationships: technical specification

Declarative cross-field relationships for n4s schemas with
dependency-aware selective `suite.changed()` runs in Vest.

Status: intended additive Vest 6 release. The new `changed()` result is
draft-typed; existing callback, `get()`, `only()`, and `focus()` types retain
their Vest 6 contract. The sound shared-callback retype is deferred to Vest 7
in [#1327](https://github.com/ealush/vest/issues/1327); see
`docs/schema-relationships-ac05-adr.md` for the decision record. This file
describes the feature and where it is implemented; it replaces the
PR-acceptance process documents (manifest, plans, readiness notes), which are
deleted with this change. The remaining executable gates are `test`,
`test:schema-relationships`, `gate:schema-coverage`,
`gate:schema-boundaries`, and `gate:schema-performance`.

## 1. Feature

Schemas declare directed dependencies between fields (e.g. `confirm`
revalidates when `password` changes). `suite.changed(field)` expands the
named fields to the affected set (named fields plus direct dependents, one
hop, no transitive closure) and runs exactly that region: schema predicates,
user tests, parsers, and retained-error maintenance all follow the same
computed selection. `only()` keeps explicit inclusion semantics without
dependency expansion. A full run validates everything and certifies complete
output.

## 2. Output model (Vest 6 compatibility)

- The suite callback (`SuiteCallbackWithSchema` in
  `packages/vest/src/suite/SuiteTypes.ts`) retains its Vest 6
  `InferSchemaOutput<S>` type. Focused runtime data can still be incomplete;
  this pre-existing `only()` / `focus()` typing limitation is documented and
  deferred to Vest 7 in #1327.
- `DeepDraft` recurses into plain objects only. Identity containers
  (arrays, tuples, `Date`, `Map`, `Set`, promises, functions) stay whole:
  focused mapping replaces them wholesale, so an absent array is the
  missing property, never a partial array.
- `Suite.run` / `runStatic` / `validate` return `SuiteResult`, whose
  `valid: true` arm carries complete `InferSchemaOutput<S>`.
- The new `changed()` builder returns `FocusedSuiteResult`, whose `valid: true`
  arm carries the draft. `valid` alone never narrows a changed-run value to
  complete output.
- Existing `only()` / `focus()` builders and `suite.get()` retain their Vest 6
  `SuiteResult` type for source compatibility.
- Runtime correspondence: first focused runs omit untouched required
  properties (own-property absent, never fabricated); later focused runs
  hydrate retained fields from the last complete mapping; absent optional
  input materializes as own `undefined` everywhere; a mapped-but-unvalidated
  value never certifies validation.

## 3. Implementation by part

### 3.1 `vest-utils` — generic primitives

`asArray` accepts `readonly` inputs. No suite, schema, or graph concepts
live here; only generic cloning, descriptor, path, and collection helpers.

### 3.2 `context` — scoped execution state

`createContext` (`packages/context/src/context.ts`) enters a value for a
callback and restores the parent in a `finally`, so nested calls and thrown
callbacks cannot leak state across suites.

### 3.3 `n4s` — graph, planning, selective execution

- Declaration: `SchemaRelationship` (`packages/n4s/src/schema/`) with
  `dependsOn` scopes; `compose` preserves relationship metadata.
- Planning: `dependencyResolver` computes the affected set for changed
  names (one hop; cycles terminate; duplicates collapse; unknown and empty
  paths are explicit no-ops). Planning never executes validators, parsers,
  or input accessors; it reads own data descriptors (behind an accessor,
  only declared schema keys expand).
- Paths: `parseAffectedFieldName` (`SchemaPath.ts`) normalizes numeric
  brackets (`travelers[1]` → `travelers.1`, item segments). Quoted-string
  brackets (`box["b"]`) do not resolve and preserve empty selection.
- Execution: `runSchemaPaths(schema, data, options)`
  (`packages/n4s/src/schema/selectiveRun.ts`) with `{ affected, only,
skip, resolvedAffected, coverage }`. `buildFocusedSchemaInstance`
  routes `only`/`skip` combinations; `buildIntersectedSchemaInstance`
  handles `only`+`skip`.
- Nested `only()`: `expandNestedOnlySelections` lifts nested selectors to
  top-level `pick()` keys and synthesizes sibling skips via
  `planNestedOnlySkips` (`planNestedOnlyStep`,
  `planNestedOnlyMissing/Leaf/Descend`, `nestedOnlyContainerBoundary`).
  Explicit whole-parent selections and co-selected sibling leaves win over
  synthesized skips. Array, tuple, and record descents throw
  `SchemaExclusionError` before excluded work executes. Union and
  composed-opaque descents are currently unresolvable (open follow-up);
  unknown paths and scalar descents preserve empty selection.
- Omission: `omitSkippedDeep` performs kind-preserving exclusion (shape,
  partial, loose); record/index exclusions that cannot be rebuilt fail
  closed instead of running excluded validators.
- Mapping: `mapWithoutValidation` runs pure parser steps without
  validators and reports provenance (mapped paths; union paths needing a
  branch witness). Chains execute via `executeMappingChain` (verdicts never
  short-circuit mapping; declared outputs compose) as opposed to
  `executeChain` (validation short-circuits). Declared parser outputs are
  tracked with `MAPPING_DECLARED_OUTPUT`, preserving explicit
  `undefined`/`null` as values.
- Parser totality: built-in string parsers (`stringParsers.ts`,
  via `mapString`) fail closed with the untouched value on non-string
  input instead of throwing `TypeError`; validators report the mismatch.
- Errors: `SchemaExclusionError` (unrepresentable exclusion),
  `FocusedSchemaMappingError` (unwitnessed union branch under focus),
  `EnforceSchemaError` (misuse).

### 3.4 `vestjs-runtime` — untouched by design

No changes in this feature. Isolate identity, reconciliation, and
pending-work ownership stay in the runtime; schema interpretation lives in
n4s and orchestration in Vest.

### 3.5 `vest` — orchestration, results, lifecycle

- Types: `Suite`, `SuiteMethods`, `FocusedMethods`, `SuiteModifiers`
  (`SuiteTypes.ts`); `SuiteResult`, `FocusedSuiteResult`
  (`suiteResult/SuiteResultTypes.ts`); `createSuite` overloads
  (`suite/createSuite.ts`) infer field keys from schema output while retaining
  the Vest 6 callback type. The new `changed()` result alone is draft-typed.
- Focus builders (`useCreateSuiteMethods.ts`): `changed()` defers
  affected-set expansion to run data (enabling root→array fan-out);
  `only()`/`focus()` snapshot caller lists at the builder boundary
  (`copyFieldLists`), so later caller mutation cannot reselect; empty
  `changed([])` is explicit zero-field scope (runs nothing, retains
  history), distinct from no-op `only([])` and destructive `skip: true`.
- Runner (`suite/useCreateSuiteRunner.ts`): resolves the affected set once
  through n4s and hands the same set to suite focus and schema execution;
  builds callback input by merging current-run parser output over the
  retained mapping (`mergeMappedPaths`, array wholesale replacement,
  skipped-path repair from retention); failing runs deliver best-effort
  parser mapping without poisoning retention; skip-all validates nothing
  and establishes no witness.
- Ownership: `pendingRunsFor` / supersede chaining settle stale handles
  with the latest outcome; superseded same-field work cannot publish while
  retained pending work on unaffected fields may finish.
- Results (`suiteResult/suiteResult.ts`): frozen summaries with
  selectors; `run.data.raw`/`parsed` distinguish input from per-run
  mapped output.
- Snapshots (`suite/cloneDataTree.ts`): detached copies preserve
  supported alias topology (shared buffers keep offsets; overlapping views
  stay aliased internally) and detach caller memory; throwing getters
  propagate with identity; setter-only properties read as `undefined`.
- Lifecycle: `remove` / `resetField` / `reset` clear authoritative state;
  supported removal (declarations actually updated, keyed or unkeyed)
  preserves unaffected results; unkeyed order changes that violate
  declaration order raise the critical order-change error; keyed tests
  (`test(name, fn, key)`) carry identity across reorders and reinsertion.
- Static runners (`runStatic`, `validate`) are stateless full
  validations outside focus.

### 3.6 Integrations — thin adapters

Adapters translate form events into Vest runs and results into form state;
they never build a second dependency graph (`DD03`, enforced by
`gate:schema-boundaries`). Async validators await settlement
(`onChangeAsync` awaiting the run) so settled verdicts reach field state;
the Standard Schema submit path stays synchronous, so submit suites must
be sync (`IN04b`, pinned in
`integrations/tanstack-form/src/nestedAsyncSubmit.test.ts`).

## 4. Focus composition contract

| Chain                                       | Result                                               |
| ------------------------------------------- | ---------------------------------------------------- |
| `changed(a)`                                | Runs `affected(a)`; failures narrowed to it          |
| `changed(a).only(b)` / `only(b).changed(a)` | Union of `affected(a)` plus `b`, either order        |
| `changed([])`                               | Runs nothing; retains previous failures              |
| `only(b).changed([])`                       | Runs `b`; retains previous failures                  |
| `changed(undefined)` / `only(undefined)`    | Clears that modifier only; otherwise a plain run     |
| `changed(a).changed(b)` / `only(a).only(b)` | Last value wins per modifier                         |
| `only(b)` alone                             | Selects `b`; no dependency expansion                 |
| `focus({ skip: s })`                        | `s` never executes; destructive skip semantics apply |

Skip precedence holds with one exception: a changed descendant executes
under a skipped ancestor. Hard skips clear retained verdicts; inclusion
narrowing (`only`) retains them.

## 5. Nested selector support matrix

| Topology                                | `only('path.leaf')` behavior                            |
| --------------------------------------- | ------------------------------------------------------- |
| shape / partial / loose hierarchies     | Supported: leaf runs once, siblings silent              |
| Parent + leaf (`only(['box','box.b'])`) | Supported: whole parent wins                            |
| Sibling leaves (`only(['a.b','a.c'])`)  | Supported: union, neither cancels the other             |
| Numeric brackets (`rows[0]`)            | Normalized to dotted item segments                      |
| Arrays, tuples, records                 | Fail closed (`SchemaExclusionError`, zero side effects) |
| Unions, composed-opaque                 | Open: currently unresolvable; fail-closed planned       |
| Unknown paths, scalar descents          | Empty selection (established behavior)                  |
| Quoted-string brackets (`box["b"]`)     | Unsupported: empty selection                            |

## 6. Error taxonomy

- `SchemaExclusionError`: exclusion/selection cannot be represented
  (record/index splits, positional splits of shared rules).
- `FocusedSchemaMappingError`: focused run needs an unwitnessed union
  branch; run a full validation first or focus the union path.
- Order-change error: unkeyed declarations ran in a different order than
  the previous run; use keyed tests for reorderable lists.
- Parser `TypeError`s from built-in string transforms on non-string
  input are eliminated: such input fails validation instead.

## 7. Deferred follow-ups (bounded, tracked here)

- Keyed reinsertion/reorder model: supported removal and same-key
  reinsertion are covered; a separate active-declaration oracle remains
  follow-up work.
- Union/composed nested-`only` fail-closed behavior.
- Quoted-string bracket path support (or explicit rejection with a
  stable error).
- Resource bounds: deep/wide smoke tests exist; a GC-enabled harness with
  predeclared CPU/heap budgets is still needed (allocation/heap/scaling).
- Benchmark stability: baseline-relative singles use a symmetric
  head/base/base/head schedule and paired ratios so machine-phase drift does
  not turn sequential measurements into false regressions.
- Architecture debt: deferred runner/extraction migrations (no big-bang
  migration mandated).

## 8. Verification pointers

- Unit/graph contracts: `packages/n4s/src/schema/__tests__/`
  (`selectiveRun.coverage`, `selectiveRun`, `dependencyResolver.coverage`,
  `mapWithoutValidation`, `execution`, `mappingProvenance`, `readiness`).
- Suite contracts: `packages/vest/src/suite/__tests__/schemaContracts.*`
  (focus, exclusions, output, async, builderReuse, nestedOnly, lifecycle,
  stateMachine, boundaries, snapshots, publicApi, lintInventory).
- Typing: `schema.types.test.ts`, packed `type-tests/consumer-typing`
  (ESM + CJS, TS 5.9.3 and minimum 5.4.5), `test:schema-relationships`
  with typechecking.
- Gates: `gate:schema-coverage` (selectiveRun 85, dependencyResolver 85,
  runner 90, clone 95), `gate:schema-boundaries` (DD01/DD03/PK01),
  `gate:schema-performance` (`--self-test`, head-only, and baseline
  comparison with raw-attempt evidence). Each ABBA observation contributes 60
  samples at frozen budgets; C12full/D13full samples are medians of five
  independent timings on both checkouts. Paired ratios, raw-side CVs, and
  bounded retries reject scheduler/GC drift without relaxing thresholds.
- Docs examples are executable (`docs:examples:test` runs the Markdown
  code blocks it names).
