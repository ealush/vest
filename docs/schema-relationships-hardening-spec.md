# Schema relationships hardening specification

Status: P0 and P1 complete; PR-local utility consolidation complete; P2
decomposition begins after the Vest 6 release baseline

Scope: schema relationships, selective `suite.changed()` execution, and the
supporting Vest/n4s architecture

Release boundary: preserve Vest 6 compatibility; reserve breaking type
corrections for Vest 7

## 1. Objective

Strengthen the schema-relationships architecture without turning PR #1326 into
an unbounded refactor. Work is ordered by user impact:

1. correctness and release safety;
2. deterministic validation infrastructure;
3. maintainability refactors with no behavior changes;
4. the intentional Vest 7 type correction; and
5. optional capability expansion.

This specification keeps these architectural invariants:

- n4s is the only owner of schema relationship semantics;
- Vest is the only owner of validation history and suite lifecycle;
- integrations translate events but never build their own dependency graph;
- planning and parser-only mapping do not execute validators;
- unsupported selective operations fail closed;
- full runs remain the trust boundary for complete-form validation; and
- Vest 6 users do not receive breaking source-type changes.

## 2. Severity rubric

| Priority | Meaning                                                                         | Release policy                                           |
| -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| P0       | Incorrect results, stale state, unsafe execution, or a compatibility regression | Must be resolved before merging PR #1326                 |
| P1       | CI nondeterminism or an unenforced extension contract that can hide defects     | Resolve before the next stable release                   |
| P2       | Concentrated complexity that raises future change risk                          | Refactor after release in behavior-preserving increments |
| P3       | Known public type unsoundness requiring a major version                         | Implement in Vest 7                                      |
| P4       | Deliberately unsupported capability                                             | Schedule independently after an API decision             |

## 3. Current baseline

PR #1326 currently provides:

- declarative `dependsOn()` relationships and `describe()` metadata in n4s;
- direct affected-path resolution with runtime array binding;
- selective schema projection and execution;
- parser-only mapping with output provenance;
- Vest `suite.changed()` orchestration;
- retained mapped values and schema failures;
- stale asynchronous-run ownership;
- detached schema snapshots;
- package-boundary, coverage, packed-consumer, integration, and performance
  gates; and
- Vest 6-compatible callback and existing focused-method types.

Current verification baseline:

- 353 test files and 4,025 tests pass;
- TypeScript reports no errors;
- packed ESM and CJS consumers pass on current TypeScript and 5.4.5;
- schema coverage and package-boundary gates pass;
- all PR checks are green; and
- no review threads remain unresolved.

## 4. P0 — merge safety

These items are complete on PR #1326. They remain permanent regression gates.

### P0.1 Preserve the Vest 6 public type surface

Required contract:

- `create(callback, schema)` continues inferring complete schema output for the
  callback;
- consumers may explicitly annotate the callback with a compatible partial
  type;
- `suite.run()`, `runStatic()`, and `validate()` keep their existing input and
  result types;
- `suite.get()`, `only()`, and `focus()` retain their Vest 6 result types;
- schema-suite trailing arguments remain permissive;
- the suite Standard Schema surface retains its Vest 6 input-shaped output
  generic; and
- only the new `changed().run()` path returns `FocusedSuiteResult` with
  `DraftSchemaOutput`.

Mixed builder chains must preserve the changed-result type in either order:

```ts
suite.changed('a').only('b').run(partial);
suite.only('b').changed('a').run(partial);
```

Evidence:

- `packages/vest/src/suite/SuiteTypes.ts`
- `packages/vest/src/suite/createSuite.ts`
- `packages/vest/src/suiteResult/SuiteResultTypes.ts`
- `packages/vest/src/__tests__/inference.schemaRelationships.test.ts`
- `packages/vest/src/suite/__tests__/schema.types.test.ts`
- `type-tests/consumer-typing/suite-consumer.{mts,cts}`

Exit criteria:

- source type tests pass;
- packed ESM and CJS declarations pass;
- TypeScript 5.4.5 and the current pinned version pass; and
- no existing Vest 6 call pattern needs a cast or new parameter.

### P0.2 Preserve execution invariants

Required contract:

- one resolved affected set drives schema execution and user-test focus;
- a selected rule executes at most once;
- skipped validators never execute through a fallback path;
- retained failures clear only when revalidated, explicitly removed, reset, or
  destructively skipped;
- failed mapping never poisons the last successful mapping;
- stale asynchronous runs cannot overwrite newer state; and
- unsupported projections throw a typed error before side effects occur.

Exit criteria:

- `yarn test` passes;
- `yarn test:schema-relationships` passes with typechecking;
- `yarn gate:schema-coverage` passes; and
- `yarn gate:schema-boundaries` passes.

### P0.3 Maintain release documentation

The ADR, technical specification, website guides, generated LLM documents, and
PR description must all state that PR #1326 is a Vest 6-compatible release.
They must link the deferred breaking work in issue #1327.

## 5. P1 — release infrastructure and extension safety

Complete these before triggering the next stable release branch.

### P1.1 Make TanStack async tests deterministic

Implementation status: complete in `1b992235`; the formerly flaky file passed
100 consecutive single-worker runs, followed by the full integration test,
typecheck, and build matrix.

Problem:

`integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts` has produced a
CI timeout while waiting for an async validation to start, despite passing on
immediate rerun and locally. Polling makes release confidence dependent on
scheduler timing.

Required implementation:

1. Replace bounded microtask polling with an explicit deferred promise or
   callback barrier owned by the test fixture.
2. Separate “validator started,” “validator may resolve,” and “form consumed
   result” signals.
3. Keep timeout protection only as a deadlock guard, not as synchronization.
4. Run the test repeatedly under constrained workers.

Code map:

- `integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts:37` —
  `deferred()`, the existing controllable-promise primitive.
- `integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts:60` —
  `pollFor()`, the scheduler-sensitive helper to remove from state-transition
  assertions.
- `integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts:110` —
  `createGatedSuite()`, where validator-start and validator-release signals
  should be exposed.
- `integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts:577` — the
  shared-schema/two-form regression that timed out in CI.

Implementation guide:

1. Add a `started` deferred signal per validation key to the gated-suite test
   fixture. Resolve it synchronously when the async validator begins.
2. Return both `started` and the existing completion gate from the fixture so
   tests can await a causal event instead of observing form state repeatedly.
3. Replace `pollFor(() => pendingByValue.has(...))` with
   `await withSafetyTimeout(started.promise, ...)`.
4. Keep `pollFor()` only for third-party state propagation that offers no
   event hook. If all uses can be replaced, delete it.
5. Add a regression where two forms start in the opposite order and resolve in
   the opposite order; assert each form consumes only its own result.
6. Run:

   ```sh
   yarn workspace @vest/integration-tanstack-form test
   for i in $(seq 1 100); do
     yarn vitest run \
       --config integrations/tanstack-form/vitest.config.ts \
       integrations/tanstack-form/src/__tests__/asyncFormRoute.test.ts \
       --maxWorkers=1 || exit 1
   done
   yarn integrations:test
   ```

Acceptance criteria:

- the test never depends on a fixed number of event-loop turns;
- each asynchronous transition is explicitly released by the test;
- 100 consecutive focused runs pass locally; and
- the full integration workflow passes twice without retry.

### P1.2 Stabilize baseline-relative performance evidence

Implementation status: complete in `623966c1`; self-tests, head-only execution,
and a clean local baseline ABBA comparison pass with 120 paired C12full and
D13full samples. CI run
[35551015090](https://github.com/ealush/vest/actions/runs/35551015090)
produced three consecutive passing attempts on the same commit:

| Attempt | C12full paired ratio | D13full paired ratio | Verdict |
| ------- | -------------------: | -------------------: | ------- |
| 1       |                1.096 |                1.077 | pass    |
| 2       |                1.071 |                1.066 | pass    |
| 3       |                1.093 |                1.044 | pass    |

Problem:

C12full has crossed the 10% boundary in one run and passed in later runs. The
current gate correctly fails stable measured regressions, but separately timed
head and baseline samples can still experience machine-phase drift.

Required implementation:

1. Preserve current thresholds and fail-closed behavior.
2. Execute head and baseline single-workload batches in an alternating ABBA
   schedule rather than in two long independent phases.
3. Record paired ratios in addition to absolute medians and coefficients of
   variation.
4. Keep raw samples, retry history, commit SHAs, Node version, and terminal
   verdict in the artifact.
5. Add deterministic self-tests for near-threshold pass, breach, instability,
   missing data, and exhausted retries.

Code map:

- `packages/vest/perf-gate/perf-pairs.test.ts:53` — `measureSingle()`.
- `packages/vest/perf-gate/perf-pairs.test.ts:72` — paired `measure()`.
- `packages/vest/perf-gate/perf-pairs.test.ts:107` — `medianTiming()`.
- `packages/vest/perf-gate/perf-pairs.test.ts:269` — C12full workload.
- `packages/vest/perf-gate/perf-pairs.test.ts:295` — D13full workload.
- `scripts/gate-schema-performance.js:101` — checkout-local measurement
  process.
- `scripts/gate-schema-performance.js:579` — final gate aggregation.
- `scripts/gate-schema-performance.js:645` — bounded single retry loop.
- `scripts/gate-schema-performance.js:812` — single-result classification.
- `scripts/gate-schema-performance.js:864` — self-test entry point.

Implementation guide:

1. Add a workload filter and one-batch output mode to
   `perf-pairs.test.ts`; keep the existing complete run as the default.
2. Add a controller in `gate-schema-performance.js` that invokes the head and
   baseline worker in an `H-B-B-H` sequence for each round.
3. Store each head observation beside its adjacent baseline observation and
   derive a paired latency ratio. Do not compare an early baseline phase with
   a later head phase.
4. Classify evidence using both paired-ratio dispersion and each side's raw
   timing dispersion. Invalid, missing, zero, or non-finite samples fail
   closed.
5. Preserve the current evidence schema fields and add a versioned
   `pairedSingles` field so existing report consumers do not silently
   reinterpret data.
6. Add fixture-driven self-tests before running real benchmarks. The
   self-tests must not depend on wall-clock timing.
7. Compare the revised gate against several historical PR heads before making
   it required.

Acceptance criteria:

- no threshold or sample count is relaxed;
- stable regressions still fail immediately;
- unstable evidence remains inconclusive after bounded retries;
- synthetic drift tests demonstrate that pairing reduces false outcomes; and
- three consecutive CI executions produce the same verdict.

### P1.3 Validate custom parser registration

Implementation status: complete in `3ffa13d4`; five new registration tests and
the full 1,615-test n4s suite pass. The complete repository suite and packed
consumer checks also pass.

Problem:

Selective mapping relies on custom parser steps being pure, but purity itself
cannot be enforced by TypeScript or JavaScript.

Required implementation:

1. Validate at registration that every name listed in `parsers` exists in the
   extension object and is callable.
2. Reject duplicate, inherited, or unknown parser names with
   `EnforceSchemaError`.
3. Preserve explicit `undefined` and `null` parser outputs.
4. Document the enforceable contract: parser steps must be deterministic,
   side-effect-free transformations; ordinary extension rules remain
   validators and are never speculatively executed.
5. Add tests proving validators are not invoked by `mapWithoutValidation`.

Code map:

- `packages/n4s/src/extendLogic.ts:49` — `extendEnforce()`, where extension
  configuration first meets the rule map.
- `packages/n4s/src/rules/parsers/parserUtils.ts:10` — parser-function
  registry.
- `packages/n4s/src/rules/parsers/parserUtils.ts:12` —
  `registerParserRules()`.
- `packages/n4s/src/rules/chainBuilder/lazyRegistry.ts:10` — lazy rule
  registration and parser metadata.
- `packages/n4s/src/rules/chainBuilder/chainBuilder.ts:179` — chain creation.
- `packages/n4s/src/schema/mapWithoutValidation.ts:54` — selective mapping
  entry point.

Implementation guide:

1. Normalize the extension object's own string keys once in `extendEnforce()`.
2. Validate the configured parser-name list against those own keys before
   mutating either registry.
3. Build the parser function list from validated names; never resolve names
   through the prototype chain.
4. Register rules and parser metadata atomically so a thrown configuration
   error leaves neither registry partially updated.
5. Test unknown names, inherited names, duplicate names, non-callable values,
   explicit `undefined` output, thrown parser errors, and a validator with an
   observable side effect.
6. Verify eager, lazy, composed, array, tuple, and shape mapping paths.

Acceptance criteria:

- invalid registration fails at definition time;
- mapping executes only explicitly registered parser functions;
- parser exceptions propagate unchanged; and
- existing parser APIs and inference remain source-compatible.

## 6. P2 — behavior-preserving decomposition

Do not combine these extractions with new behavior. Each step should be a
separate PR with characterization tests before code movement.

### P2.1 Split `n4s/schema/selectiveRun.ts`

Current size: approximately 4,200 lines.

Proposed modules:

```text
schema/selectiveRun/
├── index.ts                 public internal facade
├── pathParsing.ts           dotted/numeric path normalization
├── selectionPlan.ts         affected/only/skip planning
├── projection.ts            shape/partial/loose projection
├── omission.ts              fail-closed skip rebuilding
├── unionWitness.ts          union/composition evidence handling
├── execution.ts             direct and fallback execution
└── resultNormalization.ts   stable result and error shapes
```

Current symbol boundaries:

- `runSchemaPaths` at `selectiveRun.ts:142` remains the orchestration facade.
- `resolveAffectedPaths` at `selectiveRun.ts:1579` moves with selection
  planning.
- `mergeSupplementalResults` at `selectiveRun.ts:3018` moves with execution
  result assembly.
- `buildProjectedSchema` at `selectiveRun.ts:3188` moves with projection.
- `filterSchemaResultsToAffected` at `selectiveRun.ts:3609` moves with result
  normalization.
- `buildFocusedSchemaInstance` at `selectiveRun.ts:3866` moves with projection
  orchestration.
- `expandNestedOnlySelections` at `selectiveRun.ts:3914` moves with nested
  selection planning.
- `normalizeSelectiveSchemaResult` at `selectiveRun.ts:4125` moves with result
  normalization.

Migration sequence:

1. Extract pure path helpers.
2. Extract result normalization.
3. Extract projection and omission together behind the existing facade.
4. Extract union witness handling.
5. Leave `runSchemaPaths` as the orchestration entry point.

Implementation guide:

1. Capture current exports, error messages, result ordering, parser call
   counts, and validator call counts in characterization tests.
2. Extract functions without renaming them and re-export through
   `schema/selectiveRun/index.ts`.
3. Keep mutable execution state request-local; do not introduce module-global
   selection or projection caches.
4. Run the selective-run and schema-contract suites after every extraction,
   not only after the final directory move.
5. Compare generated declaration exports and bundle entry points before
   merging each extraction PR.

Guardrails:

- preserve `n4s/exports/internal` exports;
- do not change error classes or messages;
- compare call-count traces before and after every extraction; and
- do not reduce coverage thresholds.

### P2.2 Split `n4s/schema/dependencyResolver.ts`

Current size: approximately 775 lines.

Proposed modules:

- declaration collection;
- schema-path rebasing;
- runtime item binding;
- direct graph expansion; and
- root-path validation.

Keep `resolveInlineDeps`, `assertRuleRootedPathsValid`, and
`assertSchemaRootPathsValid` as facade exports. `resolveAffectedPaths` remains
owned by the selective-run facade. Preserve direct, one-hop semantics;
transitive expansion belongs to a separate capability decision.

Code map:

- `dependencyResolver.ts:45` — `resolveInlineDeps()` and declaration
  normalization.
- `dependencyResolver.ts:181` — safe resolver-error construction.
- `dependencyResolver.ts:206` — standalone rooted-path validation.
- `dependencyResolver.ts:237` — relationship validation against the mounted
  root.
- `dependencyResolver.ts:275` — segment-by-segment path validation.
- `dependencyResolver.ts:667` — final schema-root validation entry point.

Implementation guide:

1. Extract error formatting first; preserve thrown class, message, and cause.
2. Extract root-shape navigation and path validation as pure functions.
3. Extract declaration resolution and rebasing while keeping metadata symbols
   private to n4s.
4. Add table-driven tests for property keys, root references, array bindings,
   cycles, reused schemas, hostile keys, and throwing resolver values.
5. Compare serialized `describe()` output before and after extraction.

### P2.3 Split `vest/suite/useCreateSuiteRunner.ts`

Current size: approximately 1,500 lines.

Proposed modules:

```text
suite/runner/
├── changedFocus.ts
├── callbackMapping.ts
├── retainedMapping.ts
├── asyncOwnership.ts
├── resultSnapshots.ts
└── runSuite.ts
```

Extraction order follows the data flow: focus planning, mapping, retention,
ownership, then orchestration. No public exports should move.

Code map:

- `useCreateSuiteRunner.ts:89` — pending-run ownership registry.
- `useCreateSuiteRunner.ts:101` — superseded promise chaining.
- `useCreateSuiteRunner.ts:138` — public runner construction.
- `useCreateSuiteRunner.ts:331` — changed-path focus planning.
- `useCreateSuiteRunner.ts:492` — callback mapping dispatch.
- `useCreateSuiteRunner.ts:626` — focused mapping.
- `useCreateSuiteRunner.ts:928` — retained/current path merge.
- `useCreateSuiteRunner.ts:1286` — callback and schema-failure execution.
- `useCreateSuiteRunner.ts:1414` — schema failures represented as Vest tests.
- `useCreateSuiteRunner.ts:1461` — final result binding.

Implementation guide:

1. Extract types and pure functions before hooks or context-dependent code.
2. Move changed-focus calculation with no behavior edits and retain one call to
   n4s path resolution.
3. Move callback mapping and merge helpers together so provenance and union
   witnesses cannot diverge.
4. Move pending-run ownership as a unit with its async race tests.
5. Leave the runner as a short ordered pipeline whose stages correspond to the
   documented end-to-end data flow.
6. After each extraction, run focused tests plus the benchmark gate; reject any
   refactor that changes callback counts, result identity, or retained state.

### P2.4 Formalize the n4s-to-Vest seam

`n4s/exports/internal` is intentionally non-application-facing but is still a
published package subpath. Define its stability policy:

- Vest may consume it;
- applications should not;
- changes require synchronized n4s/Vest releases;
- the boundary gate prevents integrations from importing it; and
- its contract tests live in both packages.

Code map:

- `packages/n4s/src/exports/internal.ts` — the complete shared surface.
- `packages/n4s/package.json` — `./exports/internal` and `./internal` package
  mappings.
- `packages/vest/src/suite/changed.ts` — affected-path adapter.
- `packages/vest/src/suite/schemaValidation.ts` — retained failure adapter.
- `packages/vest/src/suite/useCreateSuiteRunner.ts` — selective execution and
  mapping consumer.
- `scripts/gate-schema-boundaries.js` — dependency-direction enforcement.

Implementation guide:

1. Write a small contract table for every internal export: caller, stability,
   side effects, error behavior, and ownership.
2. Add a compile fixture that imports only through `n4s/exports/internal`.
3. Add a boundary test that rejects integrations importing that subpath.
4. Require synchronized n4s and Vest release notes whenever the surface
   changes.

## 7. P3 — Vest 7 type soundness

Canonical tracker: [#1327](https://github.com/ealush/vest/issues/1327).

Target contract:

- `SuiteCallbackWithSchema<S, T>` receives `DraftSchemaOutput<S>`;
- `only()`, `focus()`, and `changed()` return `FocusedSuiteResult`;
- `suite.get()` returns `FocusedSuiteResult` because the last run may have
  been focused;
- full `run()`, `runStatic()`, and `validate()` retain complete
  `SuiteResult` values after `valid === true`;
- the suite Standard Schema output generic describes transformed output; and
- callback trailing arguments use `DropFirst<Parameters<T>>`.

Migration work:

1. Restore the reference implementation recorded at commit `e3bf9650`.
2. Update callback code to narrow optional values with `typeof`, `in`,
   `Object.hasOwn`, or optional chaining.
3. Update focused-result and `suite.get()` consumers similarly.
4. Publish a Vest 7 migration guide with before/after examples.
5. Run packed declaration tests against real framework integrations.

Acceptance criteria are maintained in issue #1327 and must be completed before
the major release.

Code map and restoration guide:

- Use commit `e3bf9650` as the reference implementation, not as a commit to
  cherry-pick wholesale.
- Restore `DraftSchemaOutput<S>` in `SuiteCallbackWithSchema` at
  `packages/vest/src/suite/SuiteTypes.ts`.
- Make existing focused builders and `suite.get()` return
  `FocusedSuiteResult`; keep plain `suite.run()` complete.
- Restore callback-tail inference with `DropFirst<Parameters<T>>`.
- Change the suite's `StandardSchemaV1` output generic from schema input to
  `InferSchemaOutput<S>`.
- Update `packages/vest/src/suite/createSuite.ts` overload inference.
- Update `packages/vest/src/suiteResult/SuiteResultTypes.ts` documentation and
  public exports.
- Flip the compatibility assertions in
  `type-tests/consumer-typing/suite-consumer.{mts,cts}` and the Standard Schema
  and tRPC integration fixtures.

Do this as one intentional major-release change so users receive one coherent
migration rather than several incompatible intermediate types.

## 8. P4 — capability follow-ups

These are independent product decisions, not corrections to PR #1326.

### P4.1 Transitive invalidation

Decide whether `a -> b -> c` should continue selecting only `a` and `b`, or
whether a new explicit transitive mode is needed. Do not silently change the
current one-hop contract.

Required investigation:

- cycle semantics;
- performance on wide and deep graphs;
- explainability of the resulting affected set; and
- migration behavior for schemas that currently declare every direct source.

Implementation guide:

1. Add resolver-only tests for chains, diamonds, cycles, self-edges, and
   repeated changed fields.
2. Decide whether transitivity is default, opt-in, or a separate effect before
   changing traversal.
3. Keep deterministic output ordering and deduplication.
4. Benchmark depth and fan-out independently.

### P4.2 Structured path input

Evaluate a structured path API before extending string parsing:

```ts
suite.changed(['profile', 'name']);
```

The design must distinguish a segment list from a list of independent changed
fields without ambiguity. It should address quoted bracket properties,
properties containing dots, symbols, and numeric record keys.

Code pointers:

- `packages/n4s/src/schema/SchemaPath.ts` — canonical segment model.
- `packages/n4s/src/schema/scopeProxy.ts` — declaration-side property access.
- `parseAffectedFieldName` at
  `packages/n4s/src/schema/selectiveRun.ts:1264` — runtime string
  normalization.
- `packages/vest/src/hooks/focused/focused.ts` — public field-selector type.

Implementation guide:

1. Choose a branded tuple/object representation that cannot be confused with
   `changed(['a', 'b'])`.
2. Add normalization to `SchemaPath` before changing Vest APIs.
3. Preserve string selectors indefinitely for compatibility.
4. Test dots, brackets, symbols, numeric object keys, array indices, and unsafe
   prototype keys.

### P4.3 Nested union and opaque-composition selection

Add an explicit planning representation for branch selection. Until that model
exists, retain fail-closed behavior and never run excluded validators merely to
discover a branch.

Code pointers:

- `unionAcceptedResults` at `selectiveRun.ts:2826`.
- `projectRule` / `projectItemRule` at `selectiveRun.ts:3386`.
- `nestedOnlyContainerBoundary` at `selectiveRun.ts:4103`.
- `assertUnionBranchCoverage` at
  `packages/vest/src/suite/useCreateSuiteRunner.ts:841`.

Implementation guide:

1. Define branch-witness data independently of retained output values.
2. Require either a current selected validation or a prior successful witness.
3. Never probe validators to select a branch.
4. Preserve original user exceptions and distinguish them from framework
   mapping errors.
5. Test cold, warm, failed, reset, resume, and reordered-array cases.

### P4.4 Resource budgets

Add a GC-enabled harness with declared limits for:

- graph construction;
- deep path planning;
- wide fan-out;
- retained mapping size;
- snapshot allocation; and
- repeated asynchronous supersession.

Track CPU time, peak heap, retained heap, and scaling slope. Avoid machine-
specific absolute limits where paired comparisons are possible.

Implementation guide:

1. Add fixtures for depth, width, fan-out, array size, and retained history.
2. Run under `node --expose-gc` and force collection between samples.
3. Record median, p95, p99, coefficient of variation, peak heap, and retained
   heap.
4. Establish budgets from repeated baseline runs before making them required.
5. Store raw samples as CI artifacts and fail closed on malformed evidence.

## 9. Cross-cutting validation guide

Use the narrowest command while iterating, then run the complete gate set before
merging a work item.

### Fast feedback

```sh
yarn workspace vest vitest run <changed-test-file> --maxWorkers=1
yarn vitest run --config packages/n4s/vitest.config.ts <changed-test-file> --maxWorkers=1
yarn tsc --noEmit
```

### Contract and packaging checks

```sh
yarn test:schema-relationships
yarn typecheck:consumer
yarn typecheck:consumer:min
yarn integrations:test
yarn integrations:typecheck
yarn docs:examples:test
```

### Release gates

```sh
yarn test
yarn gate:schema-coverage
yarn gate:schema-boundaries
node scripts/gate-schema-performance.js --self-test
```

Run the baseline-relative performance gate in CI, where both checkouts use the
same runner image and dependency setup. Never update thresholds merely to make
a single noisy result pass.

### Review checklist

- No validator executes during planning or parser-only mapping.
- No selected validator executes more than once.
- Error class, message, path, and cause are preserved.
- Empty, absent, `null`, and explicit `undefined` remain distinct.
- Array identity is handled at the containing-array boundary.
- Reset/remove/resume behavior remains authoritative.
- Stale async work cannot publish over newer state.
- Public declarations are tested from packed artifacts, not workspace aliases.
- Generated documentation is rebuilt and produces no diff in CI.
- Performance evidence contains raw samples and both revision SHAs.

## 10. Issue breakdown

Create one issue per independently releasable concern:

1. `test(tanstack-form): replace async polling with deterministic barriers`
2. `perf: interleave baseline and head single-workload measurements`
3. `feat(n4s): validate custom parser registration contracts`
4. `refactor(n4s): decompose selective execution behind stable facade`
5. `refactor(n4s): separate dependency collection, binding, and traversal`
6. `refactor(vest): decompose suite runner orchestration`
7. `docs(n4s): define the internal Vest integration surface policy`
8. `breaking(vest): make schema callback and focused-result types draft-safe in Vest 7` — existing #1327
9. `design(n4s): decide transitive dependency semantics`
10. `design(n4s): define unambiguous structured schema paths`
11. `feat(n4s): support nested union/composition selection`
12. `perf(schema): add CPU and heap resource budgets`

Every issue should link PR #1326, name the owning package, list observable
behavior, and include executable acceptance criteria.

Use this issue template:

```md
## Problem

Observable failure or maintenance risk, with a minimal reproducer.

## Scope

Owned package, included behavior, and explicit non-goals.

## Implementation

Target symbols and ordered red/green/refactor steps.

## Acceptance criteria

- [ ] User-visible contract
- [ ] Focused regression test
- [ ] Package/type/integration gates
- [ ] Documentation update

## Evidence

Before/after output, benchmark samples, or declaration comparison.
```

## 11. Delivery sequence

```text
PR #1326 merge
   │
   ├── P1 CI determinism and parser-contract work
   │
   ├── Vest 6 minor release
   │
   ├── P2 internal decomposition, one behavior-neutral PR at a time
   │
   ├── P4 capability decisions and independent implementations
   │
   └── P3 Vest 7 type migration (#1327)
```

P1 work may proceed in parallel where files do not overlap. P2 begins only
after the Vest 6 release baseline is tagged, providing a stable comparison
point. P3 remains isolated from P2 so type migration failures are not confused
with structural refactoring.

## 12. Rollback strategy

- P1 test-infrastructure changes can be reverted independently because they do
  not alter runtime packages.
- P1 parser validation must land behind tests proving valid registrations are
  byte-for-byte behavior compatible; revert the single change if extension
  ecosystems surface an undocumented pattern.
- Every P2 extraction must preserve the old facade, permitting a file-level
  revert without reverting later behavior.
- P4 capabilities must be additive or feature-gated until their semantics are
  proven; never replace fail-closed behavior with best-effort execution.
- The P3 type migration ships only on the Vest 7 release line and must not be
  backported to Vest 6.

## 13. Definition of done

The architecture concerns are considered addressed when:

- PR #1326 ships without a Vest 6 source-compatibility break;
- CI timing no longer controls async integration outcomes;
- performance evidence is paired and repeatable near thresholds;
- custom parser registration rejects invalid declarations early;
- the large n4s and Vest orchestration files are decomposed behind unchanged
  facades;
- unsupported selector and graph behavior is either implemented or explicitly
  rejected by stable errors;
- resource limits are measured and enforced; and
- Vest 7 completes #1327 with a published migration guide.
