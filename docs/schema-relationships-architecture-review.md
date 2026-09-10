# Schema relationships: architecture review and implementation handoff

Reviewed PR #1324 at `23eaa3bcff0bd43056cff4bc1aca9570896f3b46`.
This follow-up reviews design and correctness, not just test quantity. Production
code is unchanged. The companion `schemaContracts.architecture.test.ts` records
new failing requirements and passing regression controls.

## Verdict

Keep the public `dependsOn` plus `changed` model and the spatial/temporal domain
split. Do not merge the implementation merely because the previous twelve
failures become green. The execution and output contracts need tightening.

The chief architectural problem is multiple interpretations of the same schema:
ordinary validation, rebuilt selective fragments with supplemental execution,
parser-only mapping, and Vest's reconstruction of retained parsed output. These
interpretations disagree about failure, output presence, coverage, and identity.
The new parser test demonstrates an observable wrong value and wrong runtime
type, not just an aesthetic concern about large files.

Local mutation inside a private builder, traversal, or runtime transaction is
acceptable. Functional design requires explicit inputs, stable ownership, and
predictable outputs at the boundaries. Replacing every local array push with a
spread would not fix these issues.

## Confirmed additional defects

### A1. Parser-only mapping executes validation semantics (P1)

Locations:

- `packages/n4s/src/rules/chainBuilder/chainBuilder.ts`: `mappingChain`, `mapValue`
- `packages/n4s/src/rules/chainBuilder/chainExecutor.ts`: `executeChain`
- `packages/n4s/src/utils/RuleRunReturn.ts`: failure-output normalization
- `packages/n4s/src/schema/mapWithoutValidation.ts`: `mapValueSlot`
- `packages/vest/src/suite/useCreateSuiteRunner.ts`: `focusedMappingSource`

A custom parser accepts a string and returns `{ pass: false, type: 2 }`.
The next parser accepts that number and returns `{ value: 2 }` as its output.
Both transforms are total on their declared inputs. The documentation expressly
requires parser outputs to remain usable even when the validation verdict is
false during untouched-field mapping.

Observed: parser-only mapping returns the original string. A fresh `changed('b')`
run reports valid and calls a callback typed to receive an object with that
string instead. The final parser is not applied. Failure normalization can
already replace a parser's output before the shared chain executor short-circuits.

Required fix: represent the transform independently from the predicate verdict.
Mapping must consume each transform's actual output and continue; validation
must still fail when the same parser is selected and reports failure. Do not fix
this by making all parser verdicts pass or by globally changing legacy failure
payload normalization. The new selected-failure control guards that distinction.

Evidence: two failing ARCH-MAPPING tests and one passing selected-failure control.

### A2. Focus builders retain caller-owned mutable lists (P2)

Locations:

- `packages/vest/src/suite/useCreateSuiteMethods.ts`: `useCreateChanged`, `useCreateFocus`
- `packages/vest/src/suite/useCreateSuiteRunner.ts`: `useTransformedModifiers`

Construct `runner = suite.changed(fields)` when `fields` contains `a`, then
replace the array element with `b`. Running that previously constructed runner
now selects `b`. The same issue affects `only` and field `skip`. Group focus
already constructs a Set and therefore captures its original list.

Decision: a builder captures configuration when called. Copy caller-owned arrays
at the public boundary; normalize fields and groups consistently; accept readonly
lists in types where compatible. Do not freeze the caller's own array. The runner
may be reusable, but its configuration must not be a live reference to foreign
state. Audit cloning when a derived runner inherits configuration too.

Evidence: three failing field-list ownership tests and two passing group controls.
This is an existing focus API weakness exposed alongside the new changed API,
not a claim that all three variants were introduced by this PR.

## Blocking contract decision: fresh union mapping

The previous acceptance page's complete-output promise was too broad for arbitrary
unions. This is a correction to the design requirement, not permission to replace
failing expectations with whatever the implementation currently does.

These three requirements cannot hold for every union:

1. A first focused run returns the complete correctly parsed output.
2. No untouched validation predicate executes.
3. Branch selection may depend on arbitrary opaque predicates.

For example, the first union branch contains an opaque condition and returns an
object; the fallback keeps the input number. Without evaluating the condition or
having a valid prior branch witness, the mapper cannot know which output applies.
The ordinary first-success union ordering must remain authoritative.

Decision for this handoff: incomplete mapping must be explicit. When an untouched
union's output requires an opaque branch choice and no trustworthy mapping proof
exists, throw a descriptive focused-mapping error before invoking the callback.
Do not silently emit raw data under the schema-output type or run hidden predicates.
A full successful run can establish a witness; reuse requires matching all transform/branch inputs, including relevant root
context, and schema identity/revision. A prior result at the same array index alone is not proof
that it belongs to the current item.

Known built-in branches may support predicate-free selection only where their
mapping semantics can actually be proven from explicit metadata. Do not infer
safety from function names, TypeScript types, equal-looking values, or a cache hit.
The earlier SC-UNION fresh numeric/boolean fixture remains a target for that
supported capability; it is not a universal guarantee for custom conditions.
If that capability is not implemented for V1, revise its success expectation to
an explicit mapping error together with the capability documentation, rather
than introducing an ad hoc numeric special case just to satisfy the fixture.

New ARCH-UNION pins the safe outcome for opaque branches. This is an intentional
new error boundary replacing unsafe success. It must be documented as a limitation
before shipping. If product policy instead requires every first focused run to
succeed, explicitly permit branch validation and update the no-untouched-predicate
contract and its call-count tests. Those policies must not be conflated.

## Architectural simplification targets

### A3. Replace inferred execution coverage with an explicit outcome

`selectiveRun.ts` is 3,600 lines at the reviewed head. Size alone is not the defect:
its supplement machinery infers what executed from the first failure's path,
container membership, index ordering, and whether reconstruction kept a rule whole.
`isCoveredByMain`, `mainVisitedArrayIndex`, `mainVisitedRecordKey`, and
`projectionKeptWhole` are examples. `gap` may cause another full execution after
partial work; that creates a rerun risk, not a newly demonstrated failure here.

`SelectiveSchemaResult[]` also overloads one representation: the first element
carries output, entries carry failures, successful supplements carry coercion
patches, and `coverage.rootReevaluated` is a mutable side channel. A passing entry
can represent a filtered result rather than proof of validation.

Target an n4s-owned execution outcome with separate components:

- observed issues with exact structured paths;
- evaluated validation nodes/regions, including container constraints;
- output presence and mapping completeness;
- per-path transform/branch provenance needed for safe reuse.

Use a tagged output state such as complete/incomplete/absent; null and undefined
are values of a present output. Return coverage instead of mutating an options
object. Coverage should be recorded when a rule executes, not reconstructed from
which error survived filtering. Do not add a second tree of mutable verdicts.

Incremental route: introduce the outcome as an internal adapter first, preserve
the existing exported internal compatibility surface while migrating callers,
then replace one supplement family at a time with explicit execution records.
A new single-pass executor is a possible later destination, not a prerequisite
for fixing A1/A2 or a reason to rewrite every combinator in one commit.

### A4. Keep mapping interpretation inside n4s; keep its history in Vest

`useCreateSuiteRunner.ts` is 1,202 lines. Vest currently understands parser
provenance, array replacement, numeric path conversion, unchanged raw values,
retained union outputs, skipped-path repair, and presence-based deletion.
`mergeArrayField`, `mergedMember`, `retainedMember`, and `isParserMapped` make
schema interpretation decisions in the temporal domain.

In particular, equality with current raw input is used to infer that a member
was not mapped; retaining its old output is then positional. Provenance patches
compensate for idempotent parsers. This is a design risk across general unions and
reordering, not a claim that every tested reorder is broken. The numeric-record
probes added in this review pass.

n4s should produce mapping patches with presence, completeness, and provenance.
Vest should own the lifetime of the prior mapping and apply those patches using
an explicit policy, without deciding which parser or union branch was responsible.
Its cache must be an optimization with an invalidation contract, not the authority
that makes a schema-output type appear true. Do not move test history into n4s.

### A5. Preserve subtree intent instead of enumerating it into exact field names

`resolveAffectedPaths` expands descendants by walking both schema and live data.
Vest then feeds the resulting string list to exact-name focus matching. A user
test introduced inside keyed `each` can have a valid descendant name absent from
that precomputed enumeration, which is what the failing SC-SUBTREE test exposes.
The traversal also reads scalar getters, another previously failing contract.

Return explicit selection regions: exact field versus subtree. `changed('p')`
conveys subtree intent; ordinary `only('p')` must retain its established explicit
semantics. Match a test against a changed subtree when that test is declared.
Use segment-aware matching so `p` cannot select `phone` or `p2`. Keep groups,
skipWhen, omission, and imperative include authoritative in Vest.

Avoid enumerating ordinary object descendants just to emulate a prefix match.
Concrete collection traversal remains necessary when expanding relationship item
bindings. Preserve non-transitivity: newly affected targets must not become new
change sources. Add tests for dotted and bracket input normalization, nested
collections, and container predicates when introducing the region representation.

### A6. Snapshot and lifecycle guarantees need explicit ownership

Keep the existing tree as the authority for retained schema failures. That is a
good design: reset/remove/resume do not need to synchronize another error cache.
The resetField late-failure case still needs cancellation/generation handling in
the owner of pending tests. Do not solve it with a schema-specific blacklist.

The suite runner clones several representations per successful run: parsed
snapshot, retained mapping, callback copy, result output, and run metadata. Do not
collapse copies by sharing mutable state. First specify which object each consumer
owns and when publication happens, then eliminate redundant traversals that do
not establish another required ownership boundary. Measure clone counts and
allocation on large form payloads before calling a refactor a performance win.

Retain the previous snapshot requirements for getter failures, setter-only fields,
and shared buffers. Opaque class instances, detached mutable typed arrays, and
accessor-returned mutable copies are not universally immutable. Prefer precise
ownership language to a promise of deep immutability the implementation cannot
provide. A readonly TypeScript annotation or Object.freeze alone is not enough.

## What should remain

- Inline relationships, reusable structural rebasing, and root references.
- Directed one-hop invalidation; cycles and duplicate declarations terminate.
- n4s owns schema meaning; Vest owns temporal state and interaction policies.
- Existing predicate order and short-circuit semantics for ordinary validation.
- Tree-owned retained errors and scoped async supersession.
- Standard Schema submission performs a full run independent of focused changes.
- Opaque foreign schemas remain an explicit compatibility path; do not pretend
  that arbitrary third-party schemas support native selective execution.

`run.data.raw` currently means parsed chunk on successful schema validation. That
is confusing naming, but it is already documented and tested. Treat a future
rename as API cleanup, not a newly discovered data corruption bug. Likewise,
changing every existing mutable fluent rule into a persistent immutable builder
would be a broad compatibility project, not a targeted hardening fix.

## Implementation order and acceptance

1. Fix A2 at the builder boundary. Run ownership tests plus existing focus/groups
   and changed tests. Verify caller arrays remain mutable and inherited runners
   keep independent stable configurations.
2. Fix A1 with a genuine transform execution path. Keep normal validation failure
   behavior, output presence, custom registration, and non-idempotent parser tests.
3. Add explicit mapping completeness and the opaque-union error boundary. Remove
   unsafe success paths; document supported first-run mapping capabilities.
4. Introduce selection regions and fix the missing newly declared descendant.
   Preserve skip/group/include and one-hop graph behavior.
5. Introduce the execution outcome and migrate coverage consumers incrementally.
   Keep a characterization case for every removed fallback/supplement branch.
   Compare verdicts, executed predicates, and outputs, not just error lists.
6. Fix pending lifecycle and snapshot ownership defects in their existing owners.
   Audit serialization/resume of mapping witnesses if any new cache data is added.
7. Thin Vest's runner once the n4s contract carries enough information. Evaluate
   full/focused call counts and allocation; do not trade correctness for fewer lines.

The added architecture file contains twelve tests: six passing controls and six
failing requirements against the reviewed implementation. It is picked up by
`yarn test:schema-relationships` and the existing full test workflow. Five failures
reproduce A1/A2; one specifies the new safe opaque-union boundary. Keep the earlier
acceptance gates in `website/docs/writing_your_suite/schema_relationships_acceptance.md`.
This review does not claim new failures for transactional successor throws or
numeric-record mappings: those new probes pass.

Do not merge until failing contracts are fixed or a documented contract revision
includes paired tests for the replacement behavior. Do not count pending tests,
expected-failure annotations, or an all-green historical commit as acceptance.
