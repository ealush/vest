# PR #1324: production acceptance plan

## Scope and evidence

This is the acceptance and implementation handoff for the 2026-09-12 adversarial
review. Reviewed runtime: `c881ebd6c72cbb47b04d571a55c90e350130d80e`.
Regression-only PR head: `daef7a61de18ef9497471e6dde9e9db02b56cda6`.
It supersedes the earlier readiness verdict for release decisions, while keeping
the historical findings and fixes as evidence.

**Do not merge while the three new skip/fallback contracts are red.** Two n4s
tests and one public Vest test reproduce one incomplete exclusion mechanism,
not three independent root causes. This document is a plan, not a claim that the
tests or gates below have been implemented or passed.

The existing implementation passed 3,295 tests, the schema gate, typechecking,
builds, executable docs, formatting, and lint with zero errors. Lint warnings
were 80 versus 23 on the base. Adding the three regressions produced 89 passing
and three failing tests in the two targeted files. Existing green counts must
not be attributed to the regression-only head.

Keep the n4s/Vest domain split. Complete behavioral coverage before broad
internal migrations. No finite test matrix proves the absence of defects.

## Contract decisions

An existing contract must be preserved. A decision below resolves an ambiguous
or unavailable behavior for this acceptance plan; it must be implemented,
documented, and tested together. Do not silently downgrade it to make CI green.

| ID  | Contract                                                                                                                                                                                                                                                 | Status and rationale                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | Explicit builder field skip prevents that field's schema and imperative validators from executing at every supported depth. It clears that field's retained verdict without unselecting directly affected dependents.                                    | Existing contract; confirmed violation in nested and partial composed fallback.                                                                                                                            |
| C02 | Fallback may execute untouched validators, but cannot execute excluded child validators. A root predicate remains a root predicate and may inspect the whole input; skipping a child does not sandbox user code inside the root predicate.               | Existing exclusion guarantee, with clarified scope. Pure parser mapping is distinct from predicate execution.                                                                                              |
| C03 | If an opaque composition cannot honor an exclusion, reject the run explicitly before invoking excluded work. Recognizable built-in containers must support exclusions; throwing is not an acceptable replacement for supporting nested shape or partial. | New fail-closed decision. Use a stable machine-readable error code and document the supported boundary.                                                                                                    |
| C04 | `changed` invalidates the reported paths and their direct dependents only. It neither computes derived values nor walks transitive edges. `only` remains explicit selection.                                                                             | Existing contract. Graph resolution must precede exclusion filtering.                                                                                                                                      |
| C05 | Vest unions resolved changed paths with explicit builder `only`, then applies field skip and group constraints. Keep documented replacement/clearing behavior of repeated builder methods and existing imperative focus precedence.                      | Existing contract; do not substitute n4s's lower-level intersection algebra.                                                                                                                               |
| C06 | Mapping preserves absence versus own `undefined`, parsed values, array structure, and union-witness honesty. Focused success does not certify the whole payload; submit performs full validation.                                                        | Existing contract. No raw-input fallback masquerading as parsed output.                                                                                                                                    |
| C07 | Public callback input, retained mappings, and result values detach supported caller-owned data graphs. Materialize ordinary accessors once per property per boundary copy, drop foreign setters, preserve cycles and aliases within the copy.            | Existing ownership direction; call-count scope clarified. No promise of a single getter read across an entire multi-copy run.                                                                              |
| C08 | Planning and description do not invoke input getters, validators, or parsers. Mapping may invoke declared pure parsers; validating may invoke selected predicates.                                                                                       | Existing functional boundary. Registered parser purity is a caller obligation, not something the runtime can infer.                                                                                        |
| C09 | Superseded/reset/removed async work cannot publish stale state or late errors. Logical cancellation does not promise termination of arbitrary external work.                                                                                             | Existing lifecycle contract; test public cancellation signals where already supported.                                                                                                                     |
| C10 | Remove the unimplemented `changed(field, { signal })` overload from the V1 public type surface and documentation. Preserve the existing AbortSignal passed to async test callbacks.                                                                      | API decision: defer the new option instead of shipping a typed option that always throws. JavaScript use of an unsupported second argument should fail explicitly, rather than imply cancellation support. |
| C11 | Unexpected parser, getter, or schema-rebuild exceptions cannot silently select a broader execution route or publish a fabricated successful mapping. Preserve the original cause in the reported error.                                                  | Required error boundary. Existing validator exception-to-failure behavior remains its separate contract.                                                                                                   |
| C12 | A failed public boundary copy must not publish a partial new snapshot. Previously delivered detached snapshots remain unchanged; the suite must be usable by a subsequent valid run.                                                                     | New atomic-publication decision. Do not infer transaction rollback of arbitrary user callback side effects.                                                                                                |

Update the public guide and acceptance document for C02, C03, C07, C10–C12.
If a decision changes an existing documented behavior, call it out in the PR
changelog. Do not call a deliberately strengthened contract an old regression.

## How to test from the outer API

Use `create`, `test`, `enforce`, `compose`, public focus/lifecycle methods, public
result selectors, and public callbacks. Most tests belong beside existing suite
contracts but import the public source entrypoint. Add a separate consumer smoke
suite against built package exports; an internal source test is not packaging
evidence. Do not mock the planner, projection, reconciler, or clone helper.

Each fixture should record four independent observations:

1. Schema predicate calls and imperative test calls, using separate spies.
2. The public field errors/warnings/pending state and aggregate result.
3. Callback data and available result values, including own-property presence.
4. Settlement/publication events and mutation of caller-owned objects.

Use an independent edge-list oracle for expected direct invalidation. Never call
`resolveAffectedPaths` to calculate the expected public outcome. For projection
fixtures assert exact selected calls. For documented fallback fixtures allow
untouched calls but assert zero excluded calls and no duplicate selected work.
Account for ordinary short-circuiting: do not assert that every predicate after a
failing chain member must execute. Separate all-pass call-count fixtures from
failure fixtures and explicitly declare their execution mode.

For retained-state cases, full-run once, change the input, clear spies, then run
the focused operation. Add the first-ever focused-run variant separately. Compare
against a fresh full-run oracle only for fields required to be current; unrelated
retained verdicts may intentionally differ. Include a successful imperative test
when needed to expose `result.value`, rather than accidentally testing an absent
value on a fixture that never produces it.

Use manually controlled promises for async tests, not elapsed-time sleeps. Record
the seed and the exact event trace for randomized cases. Test helpers must express
input, operation, and observation rather than reproducing implementation branches.

Example public regression shape:

```ts
const skipped = vi.fn(() => true);
const schema = compose(
  enforce.shape({
    profile: enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.isString(),
    }),
  }),
  enforce.condition(() => true),
);
const suite = create(() => {}, schema);
suite
  .changed('profile.b')
  .focus({ skip: 'profile.a' })
  .run({
    profile: { a: 'a', b: 'b' },
  });
expect(skipped).not.toHaveBeenCalled();
```

## Test inventory and ownership

Every row is a required acceptance family, with named cases generated beneath its
ID. `Extend` means related tests already exist, not that every listed interaction
is missing. `New` means this review requires a new explicit acceptance family.
`Red` identifies tests already committed. Reuse existing tests when their exact
arrange/action/assertions satisfy a row; record the file and test title rather
than duplicating coverage. Until that mapping is recorded, the row is open.

### Exclusion, projection, and fallback: n4s implementation, Vest acceptance

| ID   | Work   | Scenario and observable acceptance                                                                                                                                                                                                  |
| ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EX01 | Red    | Keep the partial-root and nested-root regressions in n4s readiness and the nested public Vest regression. All skipped spies remain at zero.                                                                                         |
| EX02 | New    | Public partial-root counterpart: present skipped child, selected sibling, passing root condition. Selected work executes and excluded schema/imperative work does not.                                                              |
| EX03 | Extend | Parent skip versus child change; child skip versus parent change; overlapping/duplicate skips; root-scoped dependency fan-out. Exclusion covers descendants but does not swallow unaffected siblings.                               |
| EX04 | Extend | Root predicate passes/fails; skipped predicate would pass/fail/throw. Root verdict is preserved, excluded predicate never fires, selected errors stay correctly attributed.                                                         |
| EX05 | New    | Compose root chain before/after recognized container where supported, multiple composed children, nested composition. No dropped root constraint and no duplicated predicate execution.                                             |
| EX06 | New    | Partial missing child, own undefined, null, extra keys, non-enumerable declared keys. Exclusion preserves native optionality and strict/loose semantics.                                                                            |
| EX07 | New    | Concrete array index, whole item, wildcard scope, insert/remove/reorder and sparse entries. No excluded item predicate runs; sibling error paths track current indices and keys.                                                    |
| EX08 | New    | Excluded parsed child plus selected parsed sibling and root predicate. Allowed mapping is independently observed; excluded validation stays zero and returned data is honestly parsed.                                              |
| EX09 | New    | Witnessed union and excluded union under composition. Excluded alternatives are never speculatively probed; valid witnessed output remains mapped. First unwitnessed focus follows the explicit error contract.                     |
| EX10 | New    | Unsupported opaque fallback with skip fails before excluded side effects; supported nested/partial forms succeed. An injected user-level throwing parser/getter preserves its cause and does not trigger a second validation route. |
| EX11 | Extend | Seed skipped field error/warning/pending state, then skip it while a dependent reruns. Field state is cleared and stale settlement cannot restore it; group exclusion retains its distinct historical behavior.                     |
| EX12 | New    | Recovery after fallback/root failure: a later valid run yields correct values and verdicts without stale exclusion or ambient projection authority leaking into another suite.                                                      |

Mandatory bounded matrix: 3 recognized object kinds (`shape`, `partial`, `loose`)
× 3 placements (top-level child, nested child, parent subtree)
× 2 states (fresh, retained)
× 2 root outcomes (pass, fail) = **36 semantic cells**. Run each with a skipped
predicate that would pass, fail, or throw: **108 cases**. Use present children and
valid containers in this core matrix so every invocation assertion is meaningful.
Observe root verdicts and skipped call counts independently of parser mapping.

Add mandatory targeted triples rather than an unbounded Cartesian product:
partial × missing × parser; nested skip × root composition × parser;
array reorder × root dependency × retained failure; union witness × skip × parser;
parent change × child skip × pending work. Pairwise coverage of the remaining
dimensions supplements these triples; it cannot replace them. Document any
unsupported cell and assert its safe failure rather than dropping the case.

### Graph and builder API: public behavior

| ID   | Work   | Scenario and observable acceptance                                                                                                                                                                                     |
| ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GR01 | Extend | Preserve the 64-graph × 7-change-set oracle. Add multiple simultaneous invalid fields and actual schema-predicate observations alongside imperative selection.                                                         |
| GR02 | Extend | Chain A→B→C selects A,B for change A; reporting A,B selects C too. Cycles terminate, duplicate edges/changes do not duplicate execution, disconnected components remain retained.                                      |
| GR03 | Extend | Nested local and root references; reuse one schema at two paths and in two suites. Dependency scope rebases correctly, descriptions remain unchanged, and suite state is isolated.                                     |
| GR04 | Extend | Parent/descendant overlap; numeric array paths; dynamic keys; unknown and empty selectors. Pin the documented unknown-path behavior and path-encoding limits through the builder.                                      |
| GR05 | Extend | pick/omit/partial/loose/compose preserve intended relationships. Removed dangling dependencies are ignored; retained dangling references fail during construction without synthetic validator probes.                  |
| GR06 | New    | Deterministic bounded generated graphs (4–8 fields), change sets, failures, and run sequences; independent direct-edge oracle. Every failure prints reproducible seed and minimized event trace.                       |
| AP01 | Extend | changed/only union in both orders; repeated method calls replace or clear exactly as documented; empty arrays and undefined tested separately. Builder reuse cannot accumulate stale focus.                            |
| AP02 | Extend | only/skip collisions in both orders, with/without schema, changed source skipped but dependent selected, nested imperative focus. Preserve the documented no-schema compatibility correction.                          |
| AP03 | Extend | Include, skipWhen, omitWhen, optional, groups and duplicate field names across groups with changed. Assert execution, errors, pending state and retention separately, using existing modifier semantics as the oracle. |
| AP04 | Extend | ALL/EAGER/ONE modes, warnings, memo hits/misses, keyed each. Relationship invalidation does not silently force ALL mode or bypass memo invalidation rules.                                                             |
| AP05 | New    | Compile fixtures reject changed's deferred signal overload after removal; valid fluent chains retain input/output inference. Runtime misuse is explicit; test callback AbortSignal still works.                        |
| AP06 | Extend | Positive/negative type fixtures for parsers, optional members, nested fields, public exports. Do not claim typo-safe `$` paths where types still accept broad strings.                                                 |
| AP07 | New    | Stable public error identifiers for unsupported exclusion and unwitnessed union, with original cause where applicable. Consumers handle these without parsing prose messages.                                          |

### Mapping, ownership, and functional behavior

| ID   | Work   | Scenario and observable acceptance                                                                                                                                                                                                                      |
| ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MP01 | Extend | Full → focused → full sequences with coercion, transforms and sibling failures. Callback data and result value use the declared output type, never raw unparsed substitutions.                                                                          |
| MP02 | Extend | Delete property versus set undefined; optional/partial requiredness; extra keys; array holes versus own undefined. Use own-property and descriptor assertions, not JSON equality.                                                                       |
| MP03 | Extend | Union branch changes, previous witness invalidation, excluded union and first focus. A stale witness cannot certify a different branch or bypass mapping.                                                                                               |
| MP04 | Extend | Parser before/after validation, nested parsers and custom registered parsers. Counts reflect required mapping; ordinary validators are never retried as parser probes.                                                                                  |
| MP05 | Extend | Shared ArrayBuffer views, typed-array offsets/lengths, DataView and overlapping views. Callback/result copies preserve internal aliases but mutations never reach caller-owned buffers.                                                                 |
| MP06 | Extend | Object/array/Map/Set cycles, repeated references, symbols, Date/RegExp and supported descriptors. Public-boundary copies preserve supported value semantics and their documented mutability.                                                            |
| MP07 | Extend | Getter returns caller-owned nested object; setter-only property; getter returns self; repeated aliases. Public mutations are detached; foreign setters never fire; cycles terminate.                                                                    |
| MP08 | New    | Throwing getter/parser, parser-created accessors, reentrant getter running a second suite. No partial publication, original error cause observable, earlier snapshots unchanged, later valid run succeeds.                                              |
| MP09 | Extend | Saved result/callback objects across later runs and async settlement. Mutation of one public copy does not alter caller input, another run, or retained mapping.                                                                                        |
| FP01 | Extend | Freeze input and schema where supported, repeat equivalent runs, compare descriptions before/after. No writes into caller-owned objects or relationship definitions; owned accumulator mutation is allowed.                                             |
| FP02 | Extend | Public schema describe and n4s planning over getter-backed nested objects/array indices. Getter/parser/validator spies stay zero. The outer Vest run may materialize accessors at its documented data boundary, so test planning separately.            |
| FP03 | Extend | Nested suite callback throws, inner construction fails, reentrant validation. Parent context resumes correctly and the next independent suite observes no leaked execution mode or privileges.                                                          |
| FP04 | New    | Metamorphic tests: independent input-key reorder and duplicate change selectors preserve verdicts; independent change order converges after a final full run for pure fixtures. Do not assume callbacks are globally pure or dependency cycles commute. |

### Async state, integration, security, and deployment

| ID   | Work   | Scenario and observable acceptance                                                                                                                                                                                                                                      |
| ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AS01 | Extend | Start A then B; resolve/reject in both orders. Only current live work publishes; test callback signals reflect cancellation and unaffected pending work remains live.                                                                                                   |
| AS02 | Extend | reset/resetField/remove/explicit skip while pending; settle old promise success and failure. No resurrection of field error, pending count or stale mapped output.                                                                                                      |
| AS03 | Extend | Keyed reorder/insert/remove while pending, root fan-out, two forms sharing schema. Ownership follows the correct suite and reconciled field identity.                                                                                                                   |
| AS04 | Extend | after/afterField/afterEach in immediate, deferred and superseded runs. Assert documented count and ordering with controlled promises, including synchronous callbacks and late rejection.                                                                               |
| AS05 | New    | Throw during boundary copy or callback with existing pending work; then valid recovery. No publication from an invalid run; unaffected lifecycle ownership remains explicit, no unhandled rejection.                                                                    |
| IN01 | Extend | Mounted TanStack form: edit dependency source, dependent-only edit, blur, rapid edit, submit. Observe adapter/UI errors, submit callback and parsed payload; submit always full-validates.                                                                              |
| IN02 | New    | Two mounted forms share a schema; one edits/resets/unmounts while other has pending validation. No cross-form state, stale UI update or duplicate submit.                                                                                                               |
| IN03 | Extend | Standard Schema/server consumers use full validation and parsed output without relationship scheduling assumptions. Existing Hono/tRPC/env/router integration tests and typechecks stay green.                                                                          |
| IN04 | Extend | Canonical production example: nested field edits, invalid dependent, async supersession, reset, valid/invalid submit. Exercise public event flow, not mocked adapter internals.                                                                                         |
| SE01 | Extend | Unsafe path segments and own `__proto__`/constructor/prototype keys via JSON objects, nested arrays and selectors. Document reject/ignore rules; built-in prototypes and unrelated objects remain unchanged.                                                            |
| SE02 | Extend | Skipped predicate performs an observable external-effect spy or throws. Assert zero invocation through every fallback route; no real network calls in this test.                                                                                                        |
| SE03 | New    | Deep/wide/large bounded inputs, long chains and cyclic runtime data. Supported sizes terminate with bounded resource use; unsupported structures fail predictably rather than hang. Define limits from measured budgets, not guessed claims of arbitrary-depth support. |
| PK01 | New    | Build and pack affected packages, install into a clean consumer without workspace aliases. ESM and CJS imports, public subpaths, type declarations and changed+skip+parser examples all work.                                                                           |
| PK02 | Extend | Full-validation no-schema and schema consumers retain behavior except explicitly documented changes. Compare against base fixtures for focus collisions, keyed reconciliation, context exceptions and callback lifecycle.                                               |
| DO01 | Extend | Execute all public examples; regenerate website/llms and integration docs with zero drift. Remove deferred option from API examples and state full-submit validation prominently.                                                                                       |
| DO02 | New    | Contract-to-test manifest maps every row to exact cases, command and status; each declared unsupported behavior has an executable rejection test and docs link.                                                                                                         |

## DDD and clean-code acceptance

These are structural checks plus behavioral evidence. Outer API tests alone cannot
prove dependency direction or appropriate ownership of domain logic.

| ID   | Owner and required evidence                                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DD01 | n4s owns graph/path semantics, projection, exclusion enforcement and mapping provenance. Add a resolved-import dependency check covering relative imports, aliases and type imports: no upward imports from n4s into Vest or adapters.                                          |
| DD02 | Vest owns generations, retained verdicts, callback publication and cancellation. Shared-schema/two-suite public tests prove temporal isolation; inspect n4s caches to ensure they contain no per-suite lifecycle state.                                                         |
| DD03 | Adapters translate events to public Vest operations. Dependency checks forbid private planner/runner imports; code review confirms no independently maintained relationship graph.                                                                                              |
| DD04 | Context owns scoped restoration through exceptions. Run direct context regressions and FP03 public reentrancy cases; no global flags used to grant projection privileges.                                                                                                       |
| DD05 | Normalize execution selection/exclusion once at the appropriate boundary. Review every projection/fallback route against C01–C03; it must consume the same semantic exclusions, including path depth and container requiredness.                                                |
| DD06 | Distinguish unsupported projection, validation failure and unexpected execution exceptions in control flow. Public EX10/MP08 prove behavior; focused internal tests cover otherwise unreachable engine errors without forcing consumers to inspect internals.                   |
| DD07 | Extract cohesive planning, exclusion traversal, mapping/provenance and publication functions incrementally. Keep local mutations confined to owned state. Every extraction preserves the public contracts; function count and file size alone are not acceptance evidence.      |
| DD08 | Zero lint errors and no new warnings versus the reviewed head; new/extracted code obeys complexity rules without blanket disables. Inventory the 57 net additional warnings versus base, resolve warnings in the corrected fallback paths, and explicitly track remaining debt. |

A full selection-regions representation, n4s execution-outcome migration, and
runner thinning can remain separately tracked once their observable boundary
contracts pass. The exclusion fix cannot be deferred under that refactoring label.
Do not prescribe a broad rewrite solely to reach an arbitrary line-count target.

## Coverage gaps and measurable gates

The prior coverage run excluded the modified n4s readiness file to obtain a green
run (330 files, 3,227 tests). It is diagnostic evidence, not the final all-tests
coverage baseline. Re-run with all contracts after fixing the defect; commit the
coverage configuration and make CI include unimported production files.

| Module                    | Observed branch coverage | Main acceptance gaps                                                        | Proposed release floor |
| ------------------------- | -----------------------: | --------------------------------------------------------------------------- | ---------------------: |
| n4s selectiveRun          |                   72.31% | EX01–EX12, MP01–MP04, error versus fallback, presence and containers        |                    85% |
| n4s dependencyResolver    |                   69.40% | GR01–GR06, nested/root scopes, rebase, invalid paths, graph mutation inputs |                    85% |
| Vest useCreateSuiteRunner |                   86.43% | AP01–AP04, AS01–AS05, MP08–MP09, publication after failure                  |                    90% |
| Snapshot clone module     |                   95.12% | MP05–MP09, failed/reentrant boundary copies                                 |                    95% |

These floors are new acceptance targets, not claims of current compliance.
Require 100% observed outcomes for named critical decisions: skip versus execute,
unsupported versus unexpected error, live versus stale publication, absent versus
own undefined, and witnessed versus unwitnessed mapping. A numeric floor cannot
waive a missing scenario. Require at least 90% changed-line coverage for production
fixes, with both sides of changed critical branches exercised.

Use V8 branch reports to map uncovered decisions to the rows above. Do not claim
each missing branch is reachable through the public API without checking it.
Prefer outer-API tests; use narrow internal tests for true infrastructure fault
injection. Explain unreachable defensive branches individually. No blanket
coverage ignores, removal of files from the denominator, or lowered floors to
make a failing gate pass. Establish per-module baselines again after file splits
so moving code cannot erase the denominator.

Add targeted mutation checks for the highest-risk rules: remove skip filtering,
replace direct expansion with transitive expansion, accept a stale generation,
collapse missing into undefined, reuse caller buffers, swallow rebuild errors.
The relevant public tests must fail for each seeded mutant. Use reproducible
temporary changes or a mutation runner; never commit mutated production code.

## Performance acceptance

The reported C13 ratio was approximately 1.48× and D13 approximately 1.36× on the
reviewed runtime. The benchmark design specifies >10× and >20× respectively.
The successful workflow only proves that reporting completed. These are
measurements from the existing CI report, not a controlled fresh benchmark here.

| ID   | Required test and acceptance                                                                                                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PF01 | Measure end-to-end full versus changed on identical fixtures, input sizes, modes and built artifacts. Include warmup, cold creation, retained runs and repeat batches on the same runner.                                          |
| PF02 | Separate ordinary projection, composed fallback, parser-heavy mapping, arrays and async scheduling. Record predicate counts separately from elapsed time, allocation and retained heap.                                            |
| PF03 | Calculate paired C13/D13 ratios within each run. Enforce the documented >10×/>20× targets until explicitly revised with evidence; reporter must exit nonzero on a violated gate.                                                   |
| PF04 | Compare creation and full-run behavior against base on the same machine. Apply the existing A2 >10% creation-regression blocker with a predeclared repeat/noise policy. A noisy sample is inconclusive, not success.               |
| PF05 | Exercise increasing sizes and repeated reset/reuse cycles. After GC where available, retained heap must reach a stable plateau; record expected live schema caches separately from leaked suite/run data.                          |
| PF06 | Test the gate itself with synthetic pass/fail/missing-row/NaN data. Missing measurements fail closed. Store raw samples, runtime version, hardware and exact SHA; new benchmark rows cannot silently pass due to absent base rows. |

For a revised budget, document the workload, end-to-end latency objective,
allocation limit and observed distribution before accepting it. Do not retain
“ratio gate” labels for unenforced aspirations. Treat performance as unresolved
until either the published gates pass or revised requirements are explicitly
accepted and enforced. Do not infer runtime savings from fewer predicate calls.

## Implementation sequence and completion record

Place the tests where ownership is clear. The names below are proposed new files
unless an existing suite already covers the exact assertions; augment those
existing suites and record the mapping instead of creating duplicates.

| Acceptance families              | Suggested location                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EX01 existing red cases          | `packages/n4s/src/schema/__tests__/schemaContracts.readiness.test.ts` and `packages/vest/src/suite/__tests__/changed.adversarial.test.ts`                                         |
| Public EX02–EX12 and core matrix | `packages/vest/src/suite/__tests__/schemaContracts.exclusions.test.ts`                                                                                                            |
| GR01–GR06 and FP04               | Extend `packages/vest/src/suite/__tests__/schemaContracts.featureMatrix.test.ts`; add `schemaContracts.stateMachine.test.ts` in the same directory                                |
| AP01–AP07                        | Extend suite `schemaContracts.focus.test.ts`; add `schemaContracts.publicApi.test.ts` plus positive/negative type fixtures in the repository's existing type-test harness         |
| MP01–MP09, FP01–FP03             | Extend suite `schemaContracts.output.test.ts`, `schemaContracts.snapshots.test.ts`, and `schemaContracts.boundaries.test.ts`; keep getter-free planner checks at the n4s boundary |
| AS01–AS05                        | Extend suite `schemaContracts.async.test.ts` and public `after` callback tests                                                                                                    |
| IN01–IN04                        | Extend `integrations/tanstack-form/src/schemaContracts.integration.test.ts`, ecosystem integration tests and the canonical production example tests                               |
| SE01–SE03                        | Extend suite `schemaContracts.boundaries.test.ts`; add bounded resource fixtures to the benchmark harness                                                                         |
| PK01–PK02, DD01–DD08             | New clean-consumer fixtures and resolved-import checks under `scripts/`; behavior stays in package contract tests                                                                 |
| PF01–PF06                        | Existing Vest schema benchmarks plus reporter acceptance tests and a budget-check script under `scripts/`                                                                         |

For GR06/state-machine testing, start with 100 fixed seeds × 20 operations on
4–8 fields. Include full run, changed run, skip, resetField, remove and controlled
settlement; keep the oracle explicit about operations that invalidate history.
Record this finite campaign in CI and retain minimized failures as named tests.
Add separate deterministic traces for mandatory triples; seed count cannot
substitute for those cases.

1. Map existing tests to this inventory. Preserve the three red tests. Add the
   public partial regression and core exclusion matrix first. Every production
   fix needs a before/after failing test; no expected-failure annotations.
2. Fix n4s exclusion traversal while preserving container optionality, mapping and
   root validation. Add the opaque fail-closed boundary and error identity tests.
3. Complete graph/focus/mapping/lifecycle/public ownership interactions and the
   deterministic outer-API state machine. Resolve C10–C12 with matching types/docs.
4. Add consumer packaging and mounted integration coverage, dependency checks,
   coverage thresholds and targeted mutation checks. Keep commits package-scoped
   where practical, with a separate integration/gate commit.
5. Run the controlled performance campaign and enforce its outcomes. Address
   fallback complexity locally; track nonblocking migrations separately.
6. Refresh public docs, generated content, PR evidence and final gate results.

Create `docs/schema-relationships-acceptance-status.json` during implementation
(new deliverable, not created by this plan). Each row contains `id`, `status`,
`testFiles`, `testNames`, `command`, `verifiedSha`, `result`, and `notes`.
Statuses are open, covered, blocked, or unsupported-documented. The latter still
requires a passing rejection test; it cannot exempt a supported built-in case.
Do not mark a row covered from a green file count without checking its assertions.

Implement three additional scripts, explicitly new rather than existing commands:
`gate:schema-coverage`, `gate:schema-boundaries`, and `gate:schema-performance`.
The coverage gate includes all schema contracts and source files, the boundary
gate checks package imports and clean consumer installation, and the performance
gate executes actual budgets. Wire them into required CI, with failures propagated.
Ensure the behavioral gate includes `changed.adversarial.test.ts`: the current
`schemaContracts` filename filter alone does not select its public regression.

Final candidate commands (all must finish successfully):

```sh
yarn install --immutable
yarn build
yarn test
yarn gate:schema-relationships
yarn gate:schema-coverage
yarn gate:schema-boundaries
yarn gate:schema-performance
yarn example:production:test
yarn example:production:typecheck
yarn example:production:build
yarn integrations:verify
yarn website:build
yarn build:llms
yarn format
yarn lint
git diff --exit-code
```

Run generated-drift checking after committing intended source changes. Record
command, exit status and exact commit for each gate. A sandbox workaround must
identify the equivalent operations executed; a terminated or short-circuited gate
does not count. Check required GitHub workflows, including CodeQL, on that same
SHA after the final push. Earlier-head green CI is historical evidence only.

Merge acceptance requires every supported contract family mapped and green,
all critical mutants detected, coverage/performance/boundary gates passing,
documented API decisions reflected in shipped types and examples, and an explicit
maintainer merge decision. Publishing this plan does not satisfy those gates.
