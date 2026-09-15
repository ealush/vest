---
sidebar_position: 13
---

# Schema relationships: acceptance contract

This is the correctness gate for PR #1324, based on implementation commit
`13dbe73317f8e5c9ac177a64ab3d9d5a38ea180a`. It supplements
[Schema Relationships](./schema_relationships.md) and
[Schema Validation](./schema_validation.md). These are required outcomes.
The 2026-09-10 readiness review of `a923f2f4` adds 87 active tests: all 87
pass at the current head, while all 186 pre-existing contracts still pass.
None are skipped, todo, inverted, or marked as expected failures. The
readiness cases cover field-skip precedence, composed fallback execution,
and public accessor ownership.
See the [release-readiness plan](https://github.com/ealush/vest/blob/codex/schema-relationships-ready/docs/schema-relationships-release-readiness.md)
for exact findings, distinctions between existing promises and strengthened
contracts, and the required implementation sequence. A passing focused run
is not proof that an entire untrusted payload has been validated.

The original RFC proposed `schema`, `string`, and `array` shorthand and
`revalidates`. The implemented API uses `shape`, `isString`, `isArrayOf`,
`dependsOn`, and `suite.changed`. This gate targets the implemented API;
it does not introduce the deferred aliases, `$.parent`, transitive expansion,
or an AbortSignal option.

## Boundaries and functional behavior

n4s owns schema composition, structural paths, relationship descriptions,
projection, and parser output. Vest owns retained verdicts, focus, groups,
warnings, async work, and lifecycle operations. Form adapters supply event
names and translate results; they must not build another dependency graph.
No relationship itself performs a cross-field comparison: that remains a
rule or suite test.

Descriptions and graph planning must be deterministic and must not modify a
schema or caller data. Returned metadata is detached and JSON serializable.
Dependency planning must not execute validators, parsers, or input accessors.
Collection traversal reads own data descriptors to expand concrete item
bindings; behind an accessor, only declared schema keys can expand. This
includes concrete array-index paths and avoids turning introspection into
arbitrary user code execution.

Parsers must be pure; they need not be idempotent. Apply each parser stage to
its raw input (or the preceding stage's output), never last run's parsed
snapshot. A failing predicate cannot be retried until it happens to pass.
For a projected union member, evaluate alternatives in order, stop at the
first success, and keep that success's output without rerunning its validator.

## Feature and interaction matrix

`SC-*` markers occur in test names. Files below are under
`packages/vest/src/suite/__tests__/` unless otherwise stated.

| Contract                              | Required behavior                                                                                                                                                                     | Executable coverage                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SC-GRAPH                              | One-hop directed invalidation, cycles terminate, no duplicate executions; descriptions stay detached                                                                                  | `schemaContracts.featureMatrix.test.ts`: all 64 directed three-node graphs without self-edges × all 7 nonempty changed sets (448 combinations), plus duplicates and metadata isolation                     |
| SC-SCOPE                              | Local item binding, root fan-out, aggregate-source invalidation; no ambient projection privilege leaks into user-created schemas                                                      | `packages/n4s/src/schema/__tests__/schemaContracts.execution.test.ts`: array and record items, nested schema construction, getter-free scalar planning                                                     |
| SC-COVERAGE / SC-ONCE                 | Every selected member gets a verdict even after an unrelated first failure; no predicate retries                                                                                      | `schemaContracts.execution.test.ts`: shape/loose/partial/compose × passing/failing selected predicate                                                                                                      |
| SC-PATH / SC-EXCLUDE                  | Numeric record keys keep exact identity; explicitly skipped child predicates do not execute under an affected parent                                                                  | `schemaContracts.execution.test.ts`: `01`, `1`, and an integer beyond safe JS precision; parent/child exclusion                                                                                            |
| SC-RETAIN                             | Inclusion focus retains untouched schema errors and does not evaluate their predicates                                                                                                | `schemaContracts.focus.test.ts`: shape/loose/partial × only/focus/changed/only plus empty changed (12 combinations)                                                                                        |
| SC-EMPTY / SC-SKIP / SC-GROUP         | Empty changed retains history without schema predicates; explicit skip discards that field's history; group focus excludes top-level synthetic schema errors                          | `schemaContracts.focus.test.ts`                                                                                                                                                                            |
| SC-LIFECYCLE / SC-STATIC              | Reset, remove, and resetField clear authoritative history; resume restores it; runStatic discards suite state                                                                         | `schemaContracts.focus.test.ts`                                                                                                                                                                            |
| SC-SUBTREE                            | A parent edit refreshes descendant user tests, including children newly declared through keyed `each`                                                                                 | `schemaContracts.focus.test.ts`: both pass→fail and fail→pass, unrelated field isolation, newly added child                                                                                                |
| SC-OUTPUT / SC-PRESENCE               | Preserve successful falsy outputs and own-property presence                                                                                                                           | `schemaContracts.output.test.ts`: null/undefined/false/0/empty string × root/shape/array/tuple/compose (25 combinations); deletion versus explicit undefined; first skip-only mapping to present undefined |
| SC-UNION / SC-PARSER / SC-FAILURE-MAP | Complete parsed callback data on fresh and warm focus; preserve branch output across reorder/insert/remove; failure cannot poison later mapping                                       | `schemaContracts.output.test.ts`                                                                                                                                                                           |
| SC-ASYNC                              | Superseded work cannot win in either verdict direction; unrelated edits retain pending work; schema reuse cannot share async state                                                    | `schemaContracts.async.test.ts`: manually released promises; pending result has no value                                                                                                                   |
| SC-ASYNC-LIFECYCLE                    | reset/remove/resetField must prevent late work from resurrecting a failure or pending state                                                                                           | `schemaContracts.async.test.ts`                                                                                                                                                                            |
| SC-ALIAS / SC-ACCESSOR                | Detached copies preserve supported alias topology and never retain live snapshot setters                                                                                              | `schemaContracts.snapshots.test.ts`: buffers/views, shared Map/Set/symbol references, getter and setter boundaries                                                                                         |
| SC-FORM                               | Source changes reach dependent form errors; unrelated errors survive; repair enables submit; fresh focused success cannot bypass full submit validation; form instances stay isolated | `integrations/tanstack-form/src/schemaContracts.integration.test.ts`: mounted TanStack Form instances with event adapter and Standard Schema submit                                                        |
| SC-DOCS                               | The example below actually invalidates confirmation, retains an unrelated error, and recovers                                                                                         | `docsExamples.test.ts` executes the exact Markdown code block                                                                                                                                              |

Additional boundary coverage lives in `schemaContracts.boundaries.test.ts`
(16 cases): concrete-index accessor planning, shared-memory detachment,
buffer/view cycles across both buffer types, both copy modes, and both traversal
orders, composed union rejection, skip-only recovery, and empty-focus history.
`packages/n4s/src/schema/__tests__/schemaContracts.mappingProvenance.test.ts`
adds three direct/nested/optional composition cases for absolute mapping paths
and predicate-free union incompleteness reporting.

The graph matrix uses an independent edge-list oracle, not the implementation's
resolver to calculate expected results. It exhausts the stated finite graph
space, not arbitrary graph sizes or all Cartesian products of Vest features.
The additional `schemaContracts.readiness.test.ts` files exercise actual n4s
predicate calls across 64 graphs × 7 changed sets × 4 validity assignments
(1,792 executions), local/rooted dependent focus, 13 retained-state composition
cases, schema/no-schema skip collisions, composed fallback skips, and accessor
ownership through public callback and result boundaries. Predicate locality is
measured here; internal fallback counts and production latency are not.
Existing `changed.integration`, `changed.adversarial`, `changed.round2`,
`changed.supplement`, coercion, security, typing, and schema-domain tests remain
part of the regression gate. Their coverage includes nested arrays, reusable
schema rebasing, warnings, optional fields, omission, imperative inclusion,
keyed reorder, hostile paths, and deferred API rejection.

## Decisions for interactions the RFC did not settle

1. **Retained state and focus.** `only` remains explicit and does not expand
   dependencies. `changed(parent)` includes descendant schema and user tests;
   this also covers tests newly declared inside keyed `each` during that run.
   An unrelated edit preserves prior failures. Explicit skip removes its field's
   failures, takes precedence over affected-parent inclusion, and never executes
   that field's predicate. `onlyGroup` treats synthetic schema tests as top-level.
   These rules extend invalidation without changing group or skip ownership.
2. **Lifecycle while pending.** resetField is a cancellation boundary for the
   field's current result, just as remove and reset are for their scope. Late
   completion must not restore an error or pending state. This does not promise
   cancellation of the application's network request. The dotted lifecycle
   probe uses the repository's explicit runtime test seam because current
   schema-derived lifecycle types expose only top-level keys.
3. **Fresh focused output.** A first focused run over an untouched union with
   no branch witness fails explicitly with a focused-mapping error naming the
   path: it cannot advertise success with a mix of raw strings and parsed
   numbers, run hidden predicates to choose a branch, or infer safety from
   value shapes. A prior full run establishes the branch witness that warm
   focused runs reuse; focusing the union path itself validates and maps it.
   Non-union untouched fields map via pure parser transforms. Predicate-free
   branch selection for built-ins is a deferred V1 capability, not a current
   guarantee. Invalid unselected input is not certified by focused validation.
   Composition must preserve unresolved union provenance at absolute paths.
   Skip-only focus enforces the same boundary for skipped union regions.
   Empty focus preserves mapping history but cannot create a branch witness;
   a rejected focused mapping cannot seed one either.
4. **Presence.** A success with a `type` property whose value is null or undefined
   is still a successful output. Containers must preserve it. An absent optional
   key stays absent; an own key containing undefined remains present. Neither
   truthiness nor nullish coalescing can decide whether output exists.
5. **Snapshots.** Supported built-in containers must detach from caller-owned
   state while preserving shared references. Typed views that shared a backing
   buffer must share the copied backing buffer with the same offsets and lengths.
   Bytes may remain mutable in their detached copies, as already documented by
   the clone tests; this does not claim universal deep immutability.
   This includes SharedArrayBuffer-backed views. Copies preserve buffer/view
   backreferences regardless of whether traversal encounters the buffer or
   a view first, and never share backing memory with the caller's input.
6. **Accessor failure.** Immutable snapshot getters are materialized once per
   clone, with their returned object detached. If a getter throws, snapshot
   creation must propagate that error instead of keeping a live descriptor.
   Setter-only properties are represented as read-only undefined values, so
   writes cannot call a foreign setter. These two choices intentionally replace
   the current fallback behavior: silently retaining a live accessor violates
   the snapshot ownership boundary. The readiness review strengthens this at
   public schema-backed callback and result boundaries: plain-object accessor
   results must also detach there, and writes must not invoke caller-owned
   setters. This deliberately resolves the old mutable-working-clone exception
   versus the public ownership promise; it is not a regression in the immutable
   helper's existing accessor tests. Internal mutable cloning can retain its
   semantics where no public ownership boundary is crossed. Opaque class
   instances retain their documented identity limitation.
7. **Submit.** A form change event supplies an explicit changed name. A submit
   event validates the complete current payload through the Standard Schema
   surface. A fresh focused success cannot be reused as full-submit approval.
   Form change errors are message strings in this test adapter; Standard Schema
   submit errors retain structured message/path objects.

## Executable acceptance example

```ts
import { create, enforce, mode, Modes, test } from 'vest';

export function registrationAcceptance() {
  const suite = create(
    data => {
      mode(Modes.ALL);
      test('password', () => enforce(data.password).isNotBlank());
      test('confirm', 'Passwords must match', () => {
        enforce(data.confirm).equals(data.password);
      });
      test('note', 'Note required', () => enforce(data.note).isNotBlank());
    },
    enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
      note: enforce.isString(),
    }),
  );

  suite.run({ password: 'old', confirm: 'old', note: '' });
  const changed = suite.changed('password').run({
    password: 'new',
    confirm: 'old',
    note: '',
  });
  // Read before another run: suite state is temporal.
  const errorsAfterChange = changed.getErrors();
  suite.changed('confirm').run({ password: 'new', confirm: 'new', note: '' });
  const repaired = suite.changed('note').run({
    password: 'new',
    confirm: 'new',
    note: 'ready',
  });
  return { errorsAfterChange, value: repaired.value };
}
```

## Recorded verification against the implementation baseline

Against `261199ae03ba72ff096c146e159c226264f9ba7c`, the added contract files
contain 154 package tests: 142 pass and 12 fail. The three new mounted-form
integration tests and the new executable documentation test also pass,
for 158 new tests total. The graph test loops enumerate 448 combinations
inside 64 of those test cases.

The full package run reports 3,164 passing and 12 failing tests across 326
files; every failure is in a new contract test. The complete TanStack Form
workspace reports 9 passing tests. The documentation command reports 14
passing executable examples and 21 passing website tests. Strict source/test
and integration typechecks, changed-file lint, and formatting pass. Package
builds passed before testing. The full ecosystem build and website production
build have not been rerun for this tests-only change; they remain release gates.

| Failing contract   | Cases | Required production work                                             |
| ------------------ | ----- | -------------------------------------------------------------------- |
| SC-OUTPUT          | 4     | Preserve null and undefined parser outputs inside arrays and tuples  |
| SC-UNION           | 1     | Map untouched successful union members during a fresh focused run    |
| SC-SUBTREE         | 1     | Select newly declared keyed descendant tests on a parent edit        |
| SC-ASYNC-LIFECYCLE | 1     | Prevent resetField from accepting a late failure                     |
| SC-SCOPE           | 1     | Avoid reading scalar getters during graph planning                   |
| SC-ALIAS           | 2     | Preserve shared backing buffers and view offsets in both copy modes  |
| SC-ACCESSOR        | 2     | Propagate snapshot getter failures and detach setter-only properties |

These are genuine assertion failures, not intentionally inverted assertions
or expected-failure annotations. Preserve their expectations when implementing
fixes. Counts describe the reviewed baseline and will change as fixes land.

### Follow-up verification (2026-09-12, head `13dbe733`)

The 10 readiness failures above are closed by four fix commits, verified on
`13dbe73317f8e5c9ac177a64ab3d9d5a38ea180a`:

- `13e11a77 fix(vest)`: builder field skip is authoritative and destructive
  (R1, 4 tests).
- `9436c381 fix(n4s)`: composed fallback chains omit skipped top-level keys
  and recompose with the root chain preserved (R2, 2 tests).
- `328a3dcb fix(vest)`: detached working copies at public schema boundaries
  (R3, 4 tests).
- `13dbe733 fix(n4s)`: composed skip rebuild failures propagate instead of
  silently running the unfocused schema.

Evidence on that head: readiness suites 87/87; full `yarn test` 331 files /
3,295 tests with no type errors; `yarn gate:schema-relationships`,
`yarn integrations:verify`, the canonical production example (test,
typecheck, build), `yarn website:build`, `yarn build:llms` with a clean
`git diff`, `yarn format`, and `yarn lint` (0 errors) all green. The
Integration CI workflow is green on this head; the Performance Benchmark
workflow posts its numbers to the PR when it lands.

## Acceptance gates and next-agent instructions

Install with `yarn install --immutable` and build with `yarn build` first.
The targeted composite gate is `yarn gate:schema-relationships`; it stops at
the first failure. To inspect all failure categories independently, run:

| Gate                                 | Command                                                                                              | Acceptance condition                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Contract runtime and type assertions | `yarn test:schema-relationships`                                                                     | All SC tests green; no skipped/todo/expected-failure tests or unhandled rejections      |
| Real form integration                | `yarn workspace @vest/integration-tanstack-form test`                                                | Existing and new form behavior green                                                    |
| Strict source and test compilation   | `yarn vx typecheck-tests`                                                                            | Zero TypeScript errors, including the new test files                                    |
| Integration compilation              | `yarn workspace @vest/integration-tanstack-form typecheck`                                           | Zero integration TypeScript errors                                                      |
| Executable documentation             | `yarn docs:examples:test`                                                                            | Exact Markdown acceptance example and existing examples pass                            |
| Full regression                      | `yarn test`                                                                                          | Entire package suite and strict source compilation pass                                 |
| Schema coverage                      | `yarn gate:schema-coverage`                                                                          | Per-module branch floors hold (selectiveRun/dependencyResolver 85, runner 90, clone 95) |
| Schema boundaries                    | `yarn gate:schema-boundaries`                                                                        | Dependency direction, packaging smoke, and public-operation-only adapters pass          |
| Ecosystem regression                 | `yarn integrations:verify`                                                                           | All registered integration tests, typechecks, and builds pass                           |
| Production example                   | `yarn example:production:test`, `yarn example:production:typecheck`, `yarn example:production:build` | All three green                                                                         |
| Documentation and hygiene            | `yarn website:build`, `yarn format`, `yarn lint`                                                     | Documentation builds, formatting passes, and module boundaries remain enforced          |

The existing Integration workflow discovers these new tests in its package
and ecosystem test steps; no CI exclusion or allow-failure mechanism is added.
These are code acceptance gates, not a claim that GitHub branch protection
settings have been changed. Generated integration docs must also remain clean
under the workflow's existing regeneration check.

The next agent should fix production behavior by domain: output presence and
union mapping in n4s; descendant selection and pending lifecycle reconciliation
in Vest/runtime; snapshot ownership in cloneDataTree. Keep expected results
intact. If a contract proves inconsistent with an existing documented guarantee,
explain the conflict and update tests and documentation together; do not mask it
with `.skip`, `.fails`, extra retries, delays, or weakened assertions.

Passing these tests is necessary, not proof that every possible interaction is
correct. Do not use line-coverage percentage as a substitute for the verdict,
call-count, ownership, lifecycle, and real-form assertions above.

## Architecture follow-up

The [architecture review and implementation handoff](https://github.com/ealush/vest/blob/codex/schema-relationships-ready/docs/schema-relationships-architecture-review.md)
adds `schemaContracts.architecture.test.ts` to the existing gate. It covers
parser-chain failure semantics, field-list ownership, opaque union mapping,
successor exceptions, and numeric record mapping.

Clarification of the fresh-output decision above: predicate-free complete mapping
is a capability, not a universal property of arbitrary unions. If an untouched
union needs opaque predicates to determine its output and no trustworthy prior
mapping witness exists, reject the focused mapping before calling a callback
typed to receive complete output. Do not silently pass raw data or execute hidden
predicates. The review specifies how to distinguish supported built-in mapping
from this explicit error boundary and how to revise the earlier union fixture
if that capability is deferred. The baseline counts above predate these tests.
