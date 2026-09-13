---
sidebar_position: 4
title: Schema Relationships
description: Declare validation relationships between fields in Enforce schemas.
keywords: [Vest, Enforce, Schema, Relationships, dependsOn, cross-field]
---

# Schema Relationships

Validation rules frequently depend on values outside the field they validate. A password confirmation depends on the password. A state depends on the selected country. A passport number may depend on the passport country of the same traveler.

Vest can express these rules today because suites are arbitrary JavaScript:

```js
test('confirmPassword', 'Passwords must match', () => {
  enforce(data.confirmPassword).equals(data.password);
});
```

What Vest cannot know from this code is that the validity of `confirmPassword` depends on the value of `password` — that relationship exists only inside a closure.

Schema Relationships make that relationship an optional, declarative part of an Enforce schema. The schema remains responsible for describing data **and relationships between data**. The suite remains responsible for execution, retained state, warnings, async work, groups, and interaction behavior.

The model is dependency-aware invalidation of retained validation state — not dependency-driven execution. As an invariant: a validation result remains cached until its field changes or a value it depends on changes. `dependsOn()` declares the dependency half of that invariant; `suite.changed()` supplies the change event. The schema never says how to validate, in what order, or what the rule is — only which remembered results may have become stale.

`dependsOn` is the first relationship primitive. The internal representation is a single directed graph (`source → target`, `effect: 'invalidate'`) that can later host other effects without redesigning the schema API.

> Migration rule: `only()` does not follow `dependsOn` — use `changed()` for invalidation. A passing focused run is not proof the whole payload is valid: full-validate on submit.

A relationship declaration should be: ergonomic, runtime-validated during composition, composable through nested schemas, meaningful for repeated/array schemas (same-item scoped), machine-readable without parsing source, small enough that users are not maintaining a second copy of their form, colocated with the field it describes, useful to Vest itself (not just metadata), and extensible.

## Cross-field Dependencies

Sometimes validating one field depends on another.

For example, `confirmPassword` must be validated again whenever `password` changes.

Declare that relationship **inline on the field schema** — references are resolved by the containing schema:

```ts
const registrationSchema = enforce.shape({
  email: enforce.isString().isEmail(),
  password: enforce.isString().longerThanOrEquals(8),
  confirmPassword: enforce.isString().dependsOn($ => $.password),
});
```

`$` does not contain your form values.

It is an ergonomic symbolic reference to sibling fields in the **current schema scope**, runtime-validated during composition. TypeScript does not restrict property names to existing fields — any property access on `$` typechecks.

This means:

> The validation result for `confirmPassword` may become stale when the value of `password` changes.

It does **not** add a validation rule by itself.

Your suite still contains the actual business rule — and that may be arbitrary logic:

```ts
const suite = create(data => {
  test('confirmPassword', 'Passwords must match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });
}, registrationSchema);
```

The schema says _that_ the two fields are related; the suite says _why and how_. This works equally for equality checks, conditional business rules, async API checks, feature-flagged validation, and warnings. The schema never encodes execution logic.

So a field can declare a dependency even when its own Enforce rule is not the one reading the other field:

```ts
username: enforce.isString().dependsOn($ => $.organizationId);
// suite:
test('username', 'Username unavailable', async () => {
  const available = await api.checkUsername({
    organizationId: data.organizationId,
    username: data.username,
  });
  enforce(available).isTruthy();
});
```

> Schema: `username` validity depends on `organizationId`.
> Suite: here is why and how.

## Multiple Dependencies

A field may depend on more than one value. Return an array:

```ts
const schema = enforce.shape({
  quantity: enforce.isNumber(),
  unitPrice: enforce.isNumber(),
  currency: enforce.isString(),
  total: enforce
    .isNumber()
    .dependsOn($ => [$.quantity, $.unitPrice, $.currency]),
});
```

Changing any of `quantity`, `unitPrice`, or `currency` may make `total` stale. Always return refs — `($) => $.a` for one, `($) => [$.a, $.b]` for many — so the API has room to grow.

## Nested Fields — Scoped Refs

`$` is scoped to the **current schema**. References are local by default:

```ts
const accountSchema = enforce.shape({
  password: enforce.isString(),
  confirmPassword: enforce.isString().dependsOn($ => $.password),
});
```

No dotted strings to keep synchronized. A misspelled or stale field name (e.g. renaming `password` without updating `$ => $.password`) throws `EnforceSchemaError` when the containing schema is composed — a runtime check during composition, not a TypeScript compile-time error. No ESLint rule for this exists in V1.

## Reusable Nested Schemas

Dependencies declared inside a nested schema are relative to that schema and **rebase automatically** when mounted:

```ts
const addressSchema = enforce.shape({
  country: enforce.isString(),
  state: enforce.isString().dependsOn($ => $.country),
});

const checkoutSchema = enforce.shape({
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
});
```

Conceptually:

```text
billingAddress.country  → billingAddress.state
shippingAddress.country → shippingAddress.state
```

The reusable schema does not know where it will be mounted.

## Arrays and Repeated Schemas

Dependencies inside an item schema remain scoped to the **same item** — no array syntax needed:

```ts
const travelerSchema = enforce.shape({
  passportCountry: enforce.isString(),
  passportNumber: enforce.isString().dependsOn($ => $.passportCountry),
});

const bookingSchema = enforce.shape({
  travelers: enforce.isArrayOf(travelerSchema),
});
```

If `travelers[3].passportCountry` changes, only `travelers[3].passportNumber` is affected:

```text
travelers[3].passportCountry → travelers[3].passportNumber
```

Internally:

```text
travelers[$item].passportCountry → travelers[$item].passportNumber
```

The concrete index is bound at runtime. The binding is structural, not numeric.

Records work the same way with dynamic keys: a dependency inside a record
value stays scoped to the **same key** — no key syntax needed:

```ts
const schema = enforce.shape({
  dictionary: enforce.record(
    enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    }),
  ),
});
```

If `dictionary.home.country` changes, only `dictionary.home.state` is
affected. Numeric record keys (`'0'`, `'1'`) are matched the same way;
a key containing a dot cannot be addressed unambiguously with dotted
`changed()` names — prefer non-dotted keys when using `suite.changed()`.

## Dependencies Across Nesting Levels

Most relationships are local. For the unusual case that must reference outside its scope, use `$.root`:

```ts
const schema = enforce.shape({
  accountType: enforce.isString(),
  company: enforce.shape({
    country: enforce.isString(),
    taxId: enforce.isString().dependsOn($ => [$.country, $.root.accountType]),
  }),
});
```

Semantics:

- `$` — current schema scope
- `$.root` — top-level schema scope

`$.root` should be explicit and rare. Reusable locals should prefer local refs.

> **Validation timing for `$.root` paths**
>
> Local references are validated when the containing schema is composed
> (unknown siblings throw `EnforceSchemaError` immediately). Rooted paths are
> validated lazily instead: composition and `describe()` stay lenient so
> focused fragments keep composing, and an unknown `$.root` field throws on
> the first `test` / `validate` / `run` — or at suite creation, which
> finalizes the graph. `describe()` may therefore show a dangling rooted
> edge until the schema is executed.

> **Deferred to v2 — `$.parent`**
>
> `$.parent` (parent-scope escape) is **intentionally deferred** — add only if a real use case demands it.
> In V1, a resolver that touches `$.parent` throws at schema composition time with `err.message` exactly `Failed to resolve dependency for "a": $.parent deferred to v2` (an `EnforceSchemaError`).
>
> ```ts
> enforce.shape({
>   a: enforce.isString().dependsOn($ => $.parent.sibling), // throws in V1
> });
> ```

## Dependencies and Focused Validation

A dependency does not change `only()`.

```ts
suite.only('password').run(data);
```

means exactly that — run only `password`.

Dependencies answer a different question:

> A field changed. Which validation results may now be stale?

Use the available interaction API which consumes the relationship graph:

```ts
suite.changed('password').run(data);
```

Given:

```ts
confirmPassword: enforce.isString().dependsOn($ => $.password);
```

Vest derives:

```text
password
confirmPassword
```

as the affected set. This preserves `only()` semantics while giving frameworks an interaction-aware operation. Keep them separate:

- `only()` — explicit execution selection
- `changed()` — dependency-aware affected-set selection

`include()` then becomes a lower-level escape hatch, not the primary way to express cross-field behavior.

`schema.run()` reports only the first failure (pre-existing n4s behavior): with both `a` and `b` invalid, the result carries `path: ['a']` only, so surfacing every error takes repeated runs. Selective schema execution additionally re-runs the projected rule per affected array index / record key, so an affected member failure hidden behind an earlier unaffected one is still surfaced.

Split of responsibilities: Enforce owns spatial and structural truth (the graph, schema paths, selective execution); Vest owns temporal truth (retained state, test focus, reconciliation). The handshake between them is narrow — Vest hands n4s the schema, the run data, and the raw changed names; n4s returns the concrete affected set. Vest resolves that set once through the canonical planner, then gives the exact same set to both suite focus and schema execution via `runSchemaPaths(schema, data, options?)`. Everything after that is n4s-owned — container-kind detection, fragment projection, short-circuit supplementation, chain-validator preservation, and member execution. Vest never reverse-engineers container semantics.

For projectable shapes and selected array or tuple members, validators outside the affected set do not execute. Each selected rule executes once; a failed n4s verdict is never retried through another validation entry point. Union elements use ordered any-match evaluation, which can evaluate several alternatives. Keep validators pure: these guarantees do not turn validation into a side-effect scheduler.

First focused runs over untouched unions are an explicit error boundary in V1. Parser-only mapping cannot choose a union branch without validation, so when neither the focused fields cover the union member nor a prior mapped result witnesses it, the run throws a focused-mapping error naming the path instead of calling the callback with raw input. Run a full validation first — or focus the union path itself — to establish the witness that warm focused runs reuse.

This boundary also applies through `compose()` and to unions excluded by `focus({ skip: ... })`. A skip-only run restores skipped regions from a prior complete mapping; without one, an unresolved skipped union throws before the callback runs. Skipping an unrelated field still permits the validated union output. A rejected mapping does not establish a witness for later runs. `changed([])` supplies best-effort declaration data without validating any fields and preserves the previous mapping history; it cannot establish or replace a branch witness.

Affected-path planning never invokes input accessors, including concrete array-index getters. Accessor-backed subtrees expand from declared schema keys only; dynamic data keys behind an accessor cannot be enumerated without reading it.

Container validators and schemas without recognizable metadata can require a full-schema fallback. That fallback can execute untouched validators — explicitly skipped fields are still excluded (composed chains omit skipped top-level keys and keep the root chain) — and failures are then narrowed to the affected paths. An untouched dependency source does not, by itself, require full execution: ordinary object-schema projections can validate a dependent without revalidating its sources. Relationships describe invalidation, not execution prerequisites. Schema validation remains short-circuiting, and selective execution supplements affected members hidden behind the first failure. A focused result is not proof that the entire current input passed the schema. Run the full suite before submission.

Projection reads construction-time metadata and never probes validators with synthetic data. Partial fragments preserve the distinction between an absent property and an own property holding `undefined`, including declared non-enumerable properties. A shape of `optional()` members has different semantics from `partial()`.

Vest retains previously reported schema errors on untouched fields, just as it retains user-test errors. A changed run clears a retained error when that field is revalidated successfully; `resetField()`, `remove()`, and `reset()` also clear the corresponding state. `changed([])` performs no revalidation and does not clear previous failures. This history belongs to the suite, not the n4s schema or its serializable relationship graph.

### `suite.changed()` Reference

`suite.changed()` is the interaction API that consumes the relationship graph. It takes the fields the user touched and runs them plus everything the graph marks as affected:

```ts
suite.changed('password').run(data);
```

Accepted field arguments:

- `suite.changed('password')` — expand the affected set from one field.
- `suite.changed(['password', 'country'])` — expand from several fields (union of affected sets).
- `suite.changed(undefined)` — legal no-op that runs without changed focus, mirroring `only(undefined)`.
- `suite.changed([])` — explicit empty focus: runs no tests and retains previous failures.

Behavior notes:

- Returns a focused suite, so it chains with the other focus APIs: `suite.changed('password').only('confirmPassword').run(data)`. Combining `only()` with `changed()` runs the union — the `only()` base fields plus the affected set.
- Changing a whole object selects its descendants; changing a descendant also invalidates rules that depend on that whole object. Expansion remains direct, not transitive.
- Changed names accept dotted or bracket spelling. Vest normalizes `travelers[1].passportCountry` to the canonical dotted form `travelers.1.passportCountry` before planning and reporting focus. Literal property names containing dots and all-numeric record keys are ambiguous in this string API and cannot be targeted as single segments.
- Without a schema, or when the schema declares no `dependsOn` edges, `changed()` degrades gracefully: the affected set is the named fields themselves, equivalent to `only()` for that run.

### Focus Composition

The core composition contract is below. `affected(a)` is the named fields plus everything the graph marks stale. This is not an exhaustive Cartesian product of nested focus and group behavior. The [acceptance contract](./schema_relationships_acceptance.md) records open release-readiness failures; in particular, explicit skip precedence is required but not yet satisfied in all combinations.

| Chain                                             | Result                                                                                                                                                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `changed(a)`                                      | Runs `affected(a)`; schema failures narrowed to it.                                                                                                                                                               |
| `changed(a).only(b)` or `only(b).changed(a)`      | Runs the union: `affected(a)` plus `b`, in either chain order.                                                                                                                                                    |
| `changed([])`                                     | Runs nothing; previous failures are retained.                                                                                                                                                                     |
| `only(b).changed([])`                             | Runs `b`; previous failures are retained.                                                                                                                                                                         |
| `changed(undefined)`                              | Clears only changed focus. An existing `only`, skip, or group modifier remains; it is a plain run only when no other focus remains.                                                                               |
| `changed(a).changed(b)` / `only(a).only(b)`       | The last value for that modifier wins. Other modifiers remain.                                                                                                                                                    |
| `changed(a).only(undefined)`                      | Clears only explicit `only`; `affected(a)` still runs.                                                                                                                                                            |
| `changed(a).focus({ onlyGroup: g })`              | Selected user tests must also belong to `g`; synthetic schema tests remain top-level.                                                                                                                             |
| `changed(a).focus({ skipGroup: g })`              | User tests in `g` do not execute. Existing excluded group history is retained; this is not destructive field skip.                                                                                                |
| `only(b)` without `changed()`                     | Runs exactly `b`; dependents are not expanded.                                                                                                                                                                    |
| `focus({ skip: s })`, with or without `changed()` | `s` is excluded from execution and follows destructive skip semantics: its retained state is cleared, and mapping for skipped regions is restored from a prior complete run — or throws for an unwitnessed union. |

### End-to-End: Revalidating a Form on Change

A complete blur-handler flow. The schema declares the relationship once; every keystroke handler stays the same shape:

```ts
import { create, test, enforce } from 'vest';

const schema = enforce.shape({
  password: enforce.isString().longerThanOrEquals(8),
  confirmPassword: enforce.isString().dependsOn($ => $.password),
});

const suite = create(data => {
  test('password', 'Password must be at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
  test('confirmPassword', 'Passwords must match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });
}, schema);

// Initial full run on submit or mount.
let result = suite.run({ password: 'hunter22', confirmPassword: 'hunter22' });

// The user edits the password field. Re-run for the changed field:
// Vest re-runs `password` plus the affected `confirmPassword` test
// and preserves every other result.
result = suite.changed('password').run({
  password: 'hunter2',
  confirmPassword: 'hunter22',
});

result.hasErrors('confirmPassword'); // true — the stale dependent was re-evaluated
```

With several changed fields at once, pass an array — the affected set is the union:

```ts
result = suite.changed(['password', 'email']).run(nextData);
```

### Custom Parsers and Selective Runs

Selective runs apply parser steps (built-in steps like `trim()` or `toNumber()`, which only transform data) to untouched fields without executing validation predicates — so those transforms must be pure. Custom rules added with `enforce.extend` are treated as validators by default and are never executed speculatively. If a custom rule is really a parser — a pure transformation that cannot fail on its own — register it explicitly so selective runs can apply it:

```ts
enforce.extend(
  {
    normalizeId: (value: string) => ({
      pass: true,
      type: value.trim().toUpperCase(),
    }),
  },
  { parsers: ['normalizeId'] },
);
```

Unlisted custom rules keep validator treatment: they run only when their own field is in the affected set, never as mapping helpers. See [Input vs output types with parsers](./schema_validation#input-vs-output-types-with-parsers) for the full typing story.

## Dependencies Are Not Automatically Transitive

```text
A → B
B → C
```

where `A → B` means "target `B` may be stale when `A` changes."

If `A` changes, `B` must be reconsidered. `C` does not — `B`'s value didn't change. Expansion is on changed values, not transitive closure. If `C` also depends on `A`, declare it explicitly. Revalidation does not imply mutation: rerunning `B` because `A` changed does not mean `B` changed, so `B`'s dependents remain valid.

## Circular Dependencies

Cycles are valid.

```ts
const schema = enforce.shape({
  startDate: enforce.isString().dependsOn($ => $.endDate),
  endDate: enforce.isString().dependsOn($ => $.startDate),
});
```

Changing `startDate` invalidates `endDate` and vice versa. No loop occurs because dependencies describe invalidation, not imperative calls.

> **Deferred to v2 — `effect: 'revalidate'`**
>
> V1: only `effect: 'invalidate'` ("previous result is stale") is supported.
> Supplying `effect: 'revalidate'` (immediately rerun vs stale) is **deferred to v2** and will throw with `err.message` exactly `effect:'revalidate' deferred to v2 — only 'invalidate' supported in V1`.
> The assertion is at composition time (`enforce` + `lazy.ts`):
>
> ```ts
> /** @deferred v2 — effect:'revalidate' deferred, only 'invalidate' supported in V1 */
> if (effect !== 'invalidate')
>   throw new Error(
>     `effect:'${effect}' deferred to v2 — only 'invalidate' supported in V1`,
>   );
> ```
>
> Future `revalidate` vs `invalidate` distinction (immediately rerun vs stale) is deferred.
>
> `revalidates()` was removed before V1; use `.dependsOn()` for the same edge.

## Introspection

Dependency information is part of the Enforce schema and inspectable without running a suite:

```ts
schema.describe();
```

Serializable form:

```json
{
  "dependencies": [
    {
      "target": [{ "type": "property", "key": "confirmPassword" }],
      "sources": [[{ "type": "property", "key": "password" }]]
    }
  ],
  "relationships": [
    {
      "source": [{ "type": "property", "key": "password" }],
      "target": [{ "type": "property", "key": "confirmPassword" }],
      "effect": "invalidate"
    }
  ]
}
```

Array item (the item binding is `<arrayKey>.$item`):

```json
{
  "target": [
    { "type": "property", "key": "travelers" },
    { "type": "item", "binding": "travelers.$item" },
    { "type": "property", "key": "passportNumber" }
  ],
  "sources": [
    [
      { "type": "property", "key": "travelers" },
      { "type": "item", "binding": "travelers.$item" },
      { "type": "property", "key": "passportCountry" }
    ]
  ]
}
```

The representation is:

```ts
type PropertySegment = { type: 'property'; key: PropertyKey };
type ItemSegment = { type: 'item'; binding: string };
type SchemaPath = readonly (PropertySegment | ItemSegment)[];
interface SchemaRelationship {
  source: SchemaPath;
  target: SchemaPath;
  effect: 'invalidate';
  metadata?: { reason?: string };
}
interface SchemaDependency {
  target: SchemaPath;
  sources: readonly SchemaPath[];
}
```

Consumable by Vest, framework adapters, devtools, docs, and agents. Relationships stay out of `~standard`.

## What Dependencies Intentionally Do Not Do

- Does not execute anything or impose validation order — purely invalidation metadata.
- Does not inspect suite closures.
- Does not make arbitrary JS declarative.
- Does not replicate `test()`/`group()`/`warn()`/`only()`/`skipWhen`/async inside Enforce.
- Does not require deps for every cross-field test.
- Does not change Standard Schema.
- Does not change `only()` — `changed()` is separate.

## Interaction with Other Features

Schema Relationships are **metadata + `suite.changed()` in V1**. `describe()` records the graph without running a suite; `suite.changed()` consumes it to select affected tests.

| Feature                                     | Effect on `describe()`                                                                                                                  | Effect on suite `run()` / `suite.changed()` in V1                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skipWhen` (retains)                        | records                                                                                                                                 | `run()` unchanged; `changed()` treats dependent as candidate but Vest skips if `skipWhen` hides it                                                                                  |
| `omitWhen` (removes)                        | records                                                                                                                                 | `run()` unchanged; `changed()` still records edge but omitted test never runs                                                                                                       |
| `optional('field')`                         | records                                                                                                                                 | `run()` unchanged — edge exists even if optional field is absent; `changed()` includes it when source changes                                                                       |
| `include().when()`                          | **does not record** — `include` is a Vest suite modifier, not an n4s schema relationship; `schema.describe()` has no `include` metadata | `changed()` remains the interaction-aware operation                                                                                                                                 |
| `only` / `skip` / `onlyGroup` / `skipGroup` | records (expansion ignores focus: `only('password')` does not auto-include `confirmPassword`)                                           | `changed('password')` does include it; `only` merges into the affected set; synthesized failures are top-level tests, so field focus and the documented top-level group rules apply |
| `group` / `each`                            | records (rebased)                                                                                                                       | `run()` unchanged; `changed()` respects rebasing and same-item scoping; keyed `each` results follow item identity across reordered array positions                                  |
| `warn`                                      | records                                                                                                                                 | `run()` unchanged; `changed()` includes warn dependents as normal tests                                                                                                             |

V1 ships `suite.changed(field).run(data)` with dependency-aware affected-set expansion (flat, nested, reusable, array same-item, and root→array fan-out via run-time `data`). There is no options overload in V1:

> `suite.changed()` takes only the changed fields. AbortSignal-based cancellation is not a V1 feature, so no typed option implies it. JavaScript callers passing any second argument fail explicitly — `{ signal }` with `Error('suite.changed({ signal: AbortSignal }) deferred to v2')`, anything else with `Error('suite.changed() accepts no options in V1')` — instead of being silently ignored. Async test callbacks still receive their own `AbortSignal`.
>
> No behavior change for current V1 usage `suite.changed(field).run(data)`.

## Parsed Callback Snapshot Ownership

Schema-backed runs keep the caller's input, Vest's retained mapping, callback data, and published result as separate ownership boundaries. For supported data containers:

- callback and result mutations do not mutate the caller's input;
- repeated references remain aliases within each copy;
- `ArrayBuffer` and `SharedArrayBuffer` storage is copied; typed views retain their offsets, lengths, shared copied buffer, and buffer/view backreferences;
- immutable `Date`, `Map`, and `Set` snapshots reject their mutating methods;
- immutable snapshot getters are read once and their return values are detached; a throwing getter fails snapshot creation explicitly;
- setter-only properties become read-only `undefined` and never call the foreign setter;
- opaque class instances retain their identity because visible properties cannot reproduce private fields or internal slots.

These are ownership guarantees, not a promise that every copied JavaScript value is deeply immutable. Typed-array bytes and detached accessor results remain usable mutable working data without aliasing caller-owned state.

## Performance Expectations

`changed()` is a correctness and interaction primitive. It often does less validation work on large forms, but it is not guaranteed to beat `run()` on a small schema: planning, projection, supplementation, and snapshot copies have fixed costs. Use the relationship benchmarks for representative workloads and choose `changed()` when retained-field behavior and dependent invalidation match the interaction. Submission and other trust boundaries should still perform a full validation run.

## Related

- [Schema Validation](./schema_validation) — passing a schema to `create()`, parsed data, and registering custom `parsers`.
- [Focused Updates](./focused_updates) — the `only()` / `skip()` / `focus()` semantics that `changed()` builds on.
- [Handling User Interaction](./dirty_checking) — the `onBlur` / `onChange` patterns where `changed()` fits.
- [Creating Custom Rules](../enforce/creating_custom_rules) — `enforce.extend`, including parser-style rules.
- [Data Parsers](../enforce/builtin-enforce-plugins/data_parsers) — the built-in parser steps selective runs can apply safely.

## Acceptance and interaction guarantees

See the [acceptance contract and feature matrix](./schema_relationships_acceptance.md)
for executable correctness gates, lifecycle interactions, and explicitly chosen
behavior for cases the original RFC did not settle.
