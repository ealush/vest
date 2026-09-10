# PR #1324: release-readiness review and implementation plan

Reviewed on 2026-09-10 against `a923f2f405e228af743f610d60511972fc1d8bb8`,
base `cb4c7e960199063a81659b3479ec048208b9586f` (`latest`).
This supersedes earlier merge-readiness claims, not the historical record of
fixes. Follow-up commits add tests and documentation; production code is unchanged.

## Verdict

**Not ready to merge.** The original 186 schema contracts pass, but the added
87 tests expose ten failures. Six contradict the explicit-skip contract; four
codify a deliberate resolution of conflicting accessor-ownership documentation.
These are three behavioral findings, not ten independent root causes.

The n4s/Vest domain split is defensible. Keep it. A blanket rewrite or removal of
typed mapped output is not justified by this review. Conversely, green existing
tests do not establish that the runtime model is correct for every composition.
This plan supplies finite evidence and release gates, not proof of no defects.

## Reproduced findings

| ID  | Evidence and impact                                                                                                                                                                                                                      | Classification / required outcome                                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `suite.focus({ only: 'a', skip: 'a' })` executes `a`, with and without a schema. `changed('a')` plus `focus({ skip: 'a' })`, in either chain order, executes both `a` and its dependent `b`. Four new tests fail.                        | High-priority contract defect. An explicit builder field skip must prevent that field's execution, clear its retained verdict, and leave directly affected dependents selected. The no-schema reproduction shows this is not confined to the new graph. The closest-focus implementation is unchanged by this PR; do not present it as a proven newly introduced regression.           |
| R2  | A composed object schema with a root predicate falls back to full execution and calls the explicitly skipped child predicate, both when it passes and fails. Two new tests fail.                                                         | High-priority contract defect. Full fallback may validate untouched fields but must not execute explicitly skipped child predicates. Filtering their reported errors afterward is insufficient.                                                                                                                                                                                        |
| R3  | A schema-backed callback and `result.value` preserve an ordinary object's getter closure returning caller-owned data; writes through setter-only properties call the caller's setter. Four new tests fail.                               | Ownership contract conflict, now resolved in favor of detachment at public schema boundaries. Existing immutable clone-helper tests remain green. The prior acceptance text explicitly allowed mutable-clone limitations, while the public guide promised callback/result isolation; this is strengthened coverage and a clarified requirement, not a claim those old tests regressed. |
| R4  | Integration CI on the reviewed SHA failed at generated-doc verification; `website/static/llms-full.txt` differed after the build. Test, executable-doc, example, and integration steps before it passed; format/lint steps were skipped. | Release hygiene defect. Regenerate and commit derived documentation after source-doc changes. Do not describe this SHA as all-green CI.                                                                                                                                                                                                                                                |

Reproduction files:

- [n4s execution tests](../packages/n4s/src/schema/__tests__/schemaContracts.readiness.test.ts): R2, independent graph oracle, rooted/local execution locality.
- [Vest boundary tests](../packages/vest/src/suite/__tests__/schemaContracts.readiness.test.ts): R1, R3, modifier composition and retained errors.
- [afterEach test](../packages/vest/src/suite/after/__tests__/afterEach.test.ts): replaces a locally observed wall-clock race with manually controlled settlement; no runtime change.

## What the new coverage proves, and does not prove

| Surface              | Added coverage                                                                                                                                                                                                                                                      | Remaining cross-products to exercise                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graph execution      | 64 directed three-field graphs without self-edges × 7 nonempty changed sets × 4 validity assignments = 1,792 executions inside 64 tests. Independent edge-list oracle checks actual predicate calls exactly once and failure paths, not merely selected user tests. | Larger graphs, multiple simultaneous failures, container forms, parsers, and collection mutations together. No performance or fallback-rate inference from predicate counts alone. |
| Dependency direction | Two nested examples exercise local plus rooted sources. Editing only the dependent does not execute either source or an unrelated field.                                                                                                                            | Rebased reusable schemas, nested arrays/records, root fan-out after reorder/insert/remove. Existing scope tests remain required.                                                   |
| Composition          | 13 cases cover union of changed/only in both orders; repeated setters; empty and undefined clearing; skips; group intersection and retained errors.                                                                                                                 | Nested imperative focus, include/skipWhen/omitWhen, duplicate field names across groups, warnings, optional fields, memoized and keyed tests.                                      |
| Skip fallback        | Passing/failing skipped child under composed root validators.                                                                                                                                                                                                       | Nested skips, affected parents, loose/partial shapes, moved chains, container failures, parser transforms, and malformed input.                                                    |
| Public ownership     | Getter-return aliases and setter-only writes through both callback data and result.value; fixtures include a real successful user test so result.value exists.                                                                                                      | Throwing/reentrant getters, repeated aliases, cyclic getters, snapshots over successive runs, async publication, parser-created descriptors, and custom-class exceptions.          |

The existing acceptance suites still cover union witnesses, present undefined,
reset/resetField/remove, superseded async runs, schema reuse, prototype hazards,
keyed reconciliation, buffer aliases, and mounted form submission. Keep these
as orthogonal regression guards; their passing status does not exhaust the new
cross-products above. No numerical line/branch coverage claim is made here.

## Objective response to the adversarial review

| Review claim                                                                         | Assessment at the reviewed SHA                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `changed().only()` example is wrong and no composition table exists.             | Stale: the current example says union and the update adds a table. New tests confirm union in both orders. The table did still overstate completeness and `changed(undefined)` clearing; this follow-up clarifies both. R1 shows the documented skip behavior is not fully implemented.                                                                     |
| Typical dependent edits necessarily orphan sources and force full-schema execution.  | Not supported for ordinary object schemas. The new 1,792-execution matrix and rooted examples validate only the expected direct set, including dependent-only edits. The source is input context, not a prerequisite to revalidate. Container/opaque fallback remains real and needs measurement. The directional fallback claim is removed from the guide. |
| `$` and `changed()` provide schema-key typo safety.                                  | They do not currently provide that guarantee. `$` is a path-building scope with broad keys, and `changed` accepts arbitrary strings. The API reference's “typed schema scope” wording is corrected. Exact path typing is an API design task, not evidence of broken graph runtime.                                                                          |
| A first unrelated focus over an unwitnessed union throws.                            | Confirmed and intentional to protect mapped-output honesty. Do not fix it by claiming raw input is parsed output, evaluating hidden predicates, or seeding a witness from empty focus. Improve discoverability and machine-readable error handling.                                                                                                         |
| Existing `only()` users become silently wrong on upgrade.                            | Too broad. `only()` intentionally preserves existing behavior; adopting declarative relationships requires choosing `changed()`. Migration guidance must make that opt-in explicit, but changing old `only()` semantics would itself be a regression.                                                                                                       |
| Non-transitive dependencies cannot represent derived values.                         | Correct limitation, not a graph algorithm defect. Vest does not compute derived input values. Callers must report all changed values or explicitly declare every direct invalidating source; no automatic test-body read tracking is promised.                                                                                                              |
| Raw/best-effort focused callback data would simplify V1.                             | A valid alternative product scope, not a safe internal fix. It would change public callback types and runtime contracts. Do not adopt it incidentally while fixing R1–R3.                                                                                                                                                                                   |
| Mapping/projecting/supplementing is too complex and old review status is misleading. | The maintenance risk is real. Line count alone does not prove incorrectness. The historical document now scopes its resolved status to its original findings and links this review. Use behavior-preserving seams below; do not require a file-count target as a correctness gate.                                                                          |

## Architecture and functional-programming checklist

- [x] Relationship description and affected-path planning are n4s responsibilities;
      adapters do not build their own graphs. Existing scope contracts test
      getter-free planning and no ambient projection privilege leakage.
- [x] Vest owns temporal state: previous results, focused retention, generations,
      cancellation authority, and publication. n4s must not retain suite state.
- [x] Direct, non-transitive invalidation is distinct from value derivation and
      validation order. `only` is selection; `changed` adds invalidation.
- [ ] Normalize builder selection once and make every execution route honor the
      same explicit exclusions. R1/R2 currently violate this boundary contract.
- [ ] Make data ownership explicit at callback and publication boundaries (R3).
      Local mutation of a freshly owned copy is compatible with this design;
      calling a foreign setter is not. “Deeply immutable” is not the requirement.
- [ ] Audit error handling around projection: distinguish an unsupported
      projection from an unexpected exception. Broad catches that silently choose
      a different runtime route need characterization before alteration.
- [ ] Keep parser provenance and mapping completeness in n4s. Vest currently
      interprets schema/mapping details in a large runner; this is a drift risk,
      not a newly reproduced failure in every such branch.
- [ ] Establish one explicit internal execution outcome for verdicts, mapped
      presence, completeness/witnesses, and fallback reasons. This is the target
      seam; migrate incrementally after the red behaviors are pinned down.

Two intentionally different APIs need explicit documentation: n4s selection can
intersect supplied `affected` and `only`; Vest's fluent builder first unions its
explicit `only` with resolved affected fields. Do not “deduplicate” these layers
by accidentally resolving the graph twice or replacing one algebra with the other.

## Ordered implementation handoff

### 1. Vest: explicit builder-skip authority (R1)

Start with `useCreateSuiteRunner.ts` (`useChangedRunFocus`, `useRunSuiteCallback`)
and `hooks/focused/useIsExcluded.ts`. The runner installs `only` before `skip`;
the closest matching focus search returns the first matching sibling, allowing
the inclusion to win before the exclusion is considered.

1. Specify builder-field skip as authoritative for the run, independently of
   fluent call order. Do not blindly reverse global tree traversal: nested
   imperative focus has its own existing closest-scope behavior.
2. Represent/normalize selected and excluded fields once, or enforce builder
   exclusions at a clearly named boundary shared by schema and user tests.
3. Preserve affected dependents when the changed source is skipped. Do not
   remove the source from graph expansion before dependents have been resolved.
4. Verify destructive **field** skip separately from **group** exclusion. Existing
   `focus.test.ts` deliberately retains excluded group history; preserve it.
5. Extend tests with nested names, affected-parent/skip-child, both chain orders,
   include/skipWhen/omitWhen, schema errors plus user errors, and pending skipped
   fields. Assert executions, errors, warnings, pending flags, and retained data.

Exit: four R1 tests green; existing focus/group/keyed/lifecycle tests unchanged;
no-schema behavior change documented as a skip-collision correction.

### 2. n4s: exclusion-safe fallback (R2)

Inspect `selectiveRun.ts`: `runProjectedOrFull`, `changedFallbackSchema`,
projection construction, supplementary execution, and error filtering.

1. Carry explicit exclusions into every execution route, including composed and
   moved root chains. Returning the original full schema and filtering afterward
   does not satisfy the contract.
2. Preserve container/root validation and parser order. Do not make R2 green by
   stripping the root chain or silently dropping its failures.
3. Separate “untouched but permitted in fallback” from “explicitly forbidden to
   validate.” Parser-only mapping of skipped input is a separate ownership/type
   operation, not permission to call skipped validators.
4. Add passing/failing root predicates, nested containers, multiple failed
   selected members, and non-idempotent parsers. Count each predicate/parser
   stage, not only the final filtered error list.
5. If a schema category truly cannot honor exclusions, define an explicit,
   pre-execution unsupported boundary and document it before changing behavior.
   The composed shape in R2 is ordinary supported input and must pass the tests;
   do not replace its regression test with an expected throw.

Exit: R2 green, graph matrix unchanged, existing short-circuit supplementation,
presence, parser, and union contracts green. No predicate retries to repair state.

### 3. Vest: public accessor ownership (R3)

Inspect `cloneDataTree.ts` and all runner clone calls, especially callback input,
retained mapping, and `resultOutput`. Default mutable clones preserve accessor
descriptors and therefore foreign closures. Immutable-helper tests alone cannot
verify these public paths.

1. Introduce an explicit detached-working-data policy at public schema boundaries.
   Avoid globally changing every mutable clone caller or freezing callback data
   as an accidental substitute for detaching its values.
2. Materialize ordinary getters at the deliberate copy boundary, clone returned
   values through the same reference memo, propagate throwing getters, and
   represent setter-only properties without the foreign setter. Planning must
   remain getter-free. Define/test the invocation count per ownership copy.
3. Preserve cycles, symbols, descriptor/presence semantics, Map/Set aliases,
   Date behavior, shared buffer/view offsets and backreferences. Preserve the
   documented opaque-class identity exception rather than manufacturing broken
   class instances from visible properties.
4. Test mutation independently at input, callback, retained state, and result
   boundaries across full/focused/failed/pending runs. Add getters returning the
   owner and the same object via several paths; test a throwing getter cannot
   publish partial state or leave old work authoritative.

Exit: four R3 tests green, old snapshot/boundary tests green, no hidden getter
execution during planning, and public guide/acceptance language agrees.

### 4. Lifecycle and integration cross-check after fixes

Use manually controlled promises, not elapsed-time assumptions. Extend the
mounted form tests, not a mock dependency resolver:

- Change source → dependent pending → skip/resetField/remove → reject late.
  Assert current errors, pending flags, result publication, and callback counts.
- Supersede a run in both verdict directions; reorder/remove keyed items while
  dependent work is pending; reuse one schema in two independent forms.
- Verify whether old run promises settle after each cancellation boundary and
  codify that result-handle contract separately from physical request abortion.
- Combine change-time parsing/retention with full Standard Schema submit. A
  focused green result must not authorize submission of invalid untouched data.
- Test fresh union focus failure and warm recovery through the adapter, preserving
  structured submit paths versus change-time message strings.

Exit: no cross-form/state leakage, no late failure resurrection, no new unhandled
rejections, and all adapter/example test, typecheck, and build commands green.

### 5. API, diagnostics, documentation, and performance

Before release:

1. Make the initial focused-union boundary prominent in onboarding. Provide a
   stable exported error class or code if consumers must catch it; include
   canonical path and recovery instructions. Test nested paths and no witness
   creation after rejection. Do not assert the wrong bracket/dot spelling.
2. State that `$` is runtime path construction, and that static typo rejection
   for `changed()` is not currently guaranteed. Decide whether to retain this
   explicit V1 limitation or implement schema-derived paths plus a deliberate
   dynamic-path escape hatch. If tightening types, test all three changed API
   surfaces, arrays, records, optional/union nesting, no-schema suites, and TS
   instantiation cost. A bare `| string` defeats typo safety.
3. Provide migration examples: keep `only` for explicit selection, use `changed`
   for schema invalidation, keep `include().when()` for imperative test inclusion,
   declare cross-field assertions separately, and fully validate on submit.
   Do not imply automatic read tracking or derived-value propagation.
4. Profile ordinary shapes, composed root chains, nested collections, parsing,
   unions, failure-first inputs, and fresh versus warm focus. Record predicate
   counts, fallback reasons/counts, mapping/copy work, and latency distributions
   against full run. Predicate locality alone is not a measured fallback rate.
   Predeclare workload-specific regression budgets; do not invent a universal
   speedup threshold from a friendly benchmark.
5. Regenerate AI-facing documentation and run executable examples. Update PR
   validation against the final SHA, not an older green production tree.

### 6. Controlled simplification after behavior is secured

Extract pure modifier normalization, selection planning, projection decisions,
execution outcome, and retained-state transition helpers behind characterized
interfaces. Give n4s ownership of parser/mapping completeness; give Vest only the
information needed to retain and publish it. Prefer explicit data results over
boolean combinations and exception-driven normal fallback.

Move one seam per package-scoped commit. Do not combine extraction with changing
union semantics, selection representation, or clone policy. The full selection-
regions representation, complete execution-outcome migration, and runner thinning
can remain separately tracked follow-ups if R1–R3 and the release gates are green.
They become blockers if a correctness fix cannot be expressed consistently without
them. File splitting alone is not evidence of improved correctness.

## Gates and recorded evidence

At the reviewed production tree, with this follow-up's tests and timer-fixture fix:

- Build completed successfully.
- Schema contracts: **263 passed / 10 failed** (273 total); all original 186 pass.
- Full package suite: **3,285 passed / 10 failed** (3,295 total); no Vitest type
  errors. The root test script stops on the red tests before its final `tsc`.
- Standalone `tsc --noEmit`, `vx typecheck-tests`, and touched-test ESLint pass.
- TanStack Form tests: **9 passed**. Executable documentation: **14 passed**;
  website tests: **21 passed**. Touched-file formatting and diff checks pass.
- Full ecosystem and website production builds, repo-wide format/lint, and a new
  benchmark campaign were not rerun locally in this pass. They remain release
  gates; old-head CI is not a substitute for final-head verification.
- Original-head CI: [Integration failed on generated docs](https://github.com/ealush/vest/actions/runs/34496879057),
  [CodeQL passed](https://github.com/ealush/vest/actions/runs/34496879004),
  [Benchmark passed](https://github.com/ealush/vest/actions/runs/34496878963).
  This is not a statement about CI on the later test/documentation commits.

Run the following on the final candidate SHA; a short-circuited gate is not a pass:

```sh
yarn build
yarn test:schema-relationships
yarn test
yarn tsc --noEmit
yarn gate:schema-relationships
yarn example:production:test
yarn example:production:typecheck
yarn example:production:build
yarn integrations:test
yarn integrations:typecheck
yarn integrations:build
yarn website:build
yarn integrations:docs
yarn build:llms
yarn format
yarn lint
git diff --exit-code
```

Run `git diff --exit-code` after committing intended source changes, so it checks
generated drift rather than rejecting legitimate work in progress. The dedicated
gate bundles schema contracts, TanStack integration, package type-test fixtures,
adapter types, and executable docs. Current CI covers many equivalent steps but
does not invoke that literal gate; keep its coverage mapping explicit.

Release checklist:

- [ ] Every new red contract green without skips, todos, expected-failure markers,
      weakening the oracle, or silently removing supported cases.
- [ ] Changed branches covered for both success/failure and fresh/retained state;
      each production fix has a test that failed before the fix.
- [ ] Deterministic async/lifecycle and public adapter checks above completed.
- [ ] Types, exports, executable docs, generated artifacts, formatting, and lint
      all pass; no silently interrupted gate is reported as green.
- [ ] Performance report distinguishes ordinary projection from fallback and
      discloses unsupported/unmeasured cases.
- [ ] Required CI completed successfully on the exact final head; recheck head
      drift and mergeability after any further user update or reorganization.
- [ ] PR summary records current evidence, known limits, and follow-up ownership.
- [ ] Maintainer explicitly approves merge. This review does not merge the PR.
