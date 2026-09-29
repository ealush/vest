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

`schema.run()` reports only the first failure (pre-existing n4s behavior): with both `a` and `b` invalid, the result carries `path: ['a']` only, so surfacing every error takes repeated runs. Selective schema execution runs each selected array index / record key on its own, so an affected member failure hidden behind an earlier unaffected one is still surfaced.

Split of responsibilities: Enforce owns spatial and structural truth (the graph, schema paths, selective execution); Vest owns temporal truth (retained state, test focus, reconciliation). The handshake between them is narrow — Vest hands n4s the schema, the run data, and the raw changed names; n4s returns the concrete affected set. Vest resolves that set once through the canonical planner, then gives the exact same set to both suite focus and schema execution via `runSchemaPaths(schema, data, options?)`. Everything after that is n4s-owned — container-kind detection, fragment projection, short-circuit supplementation, chain-validator preservation, and member execution. Vest never reverse-engineers container semantics.

Validators outside the affected set never execute. Each selected rule executes once; a failed n4s verdict is never retried through another validation entry point. Union elements use ordered any-match evaluation, which can evaluate several alternatives. Keep validators pure: these guarantees do not turn validation into a side-effect scheduler.

Planning decides whether a selection can execute on its own before any validator, parser, or user test runs. When it cannot, `changed()` throws `SchemaExclusionError` instead of running the whole schema and hiding the unselected verdicts. Select the containing field, or run the full suite, in these cases:

- a member of a `compose()` root, or a descendant of any container with validators chained after it (for example `enforce.shape({...}).someRule()`);
- an index of a root-level array schema;
- a descendant inside a union member (`rows.0.kind` under `isArrayOf(A, B)`) — select the member (`rows.0`) instead;
- a descendant of a scalar field, or an unknown property whose value is explicitly `undefined` on a strict shape.

Record keys are selected independently: `changed('dict.key')` runs the record's key and value rules for that entry only. Unknown fields and prototype-sensitive names (`__proto__`, `constructor`, `prototype`) select nothing. Schemas that are not n4s schemas (foreign Standard Schema validators) have no member structure and validate whole; Vest's focus then scopes which results are reported.

Affected-path planning never invokes input accessors, including concrete array-index getters. Accessor-backed subtrees expand from declared schema keys only; dynamic data keys behind an accessor cannot be enumerated without reading it.

Skips that descend inside a `record()` region cannot be honored (every key shares one value rule) and fail closed with a `SchemaExclusionError` before any validator runs; skipping the whole record remains supported. An untouched dependency source does not, by itself, require full execution: ordinary object-schema projections can validate a dependent without revalidating its sources. Relationships describe invalidation, not execution prerequisites. Schema validation remains short-circuiting, and selective execution supplements affected members hidden behind the first failure. A focused result is not proof that the entire current input passed the schema. Run the full suite before submission.

A `changed()` run's callback receives the input exactly as supplied: unselected fields are neither parsed nor validated to prepare it. Its `result.value` and `run.data.parsed` are drafts holding only the values this run established — unselected properties are absent and unselected array positions are holes. Output from earlier runs is never carried forward, and resuming serialized state restores verdicts, not output. Only a full run certifies complete schema output. Unreported changes to other fields remain caller invalidation responsibility: `changed()` reports invalidation for the fields you name, it does not deep-diff your data.

For Vest 6 compatibility, the existing suite callback, `only()`, `focus()`, and `suite.get()` types keep their complete-output contract even though focused runtime data can be incomplete. The new `changed()` result is draft-typed, while a full-run result after `if (result.valid)` remains complete. Narrow callback reads defensively when the suite can run in a focused mode. The fully sound callback and existing-focused-result retype is planned for Vest 7 in [#1327](https://github.com/ealush/vest/issues/1327):

```ts
const suite = create(
  data => {
    // Vest 6 preserves the complete callback type for compatibility.
    // This can still be absent at runtime during a focused invocation.
    data.n.toFixed();
    test('note', () => {});
  },
  enforce.shape({
    n: enforce.isNumeric().toNumber(),
    note: enforce.isString(),
  }),
);

const focused = suite.changed('note').run({ note: 'ok' });
if (focused.valid) {
  // changed() is new, so its result can honestly expose the draft contract.
  // @ts-expect-error: changed valid does not prove complete output
  focused.value.n.toFixed();
  if (focused.value && typeof focused.value.n === 'number')
    focused.value.n.toFixed();
}

const full = suite.run({ n: '7', note: 'ok' });
if (full.valid) full.value.n.toFixed(); // complete: compiles
```

Nested `only()` selects known nested leaves in shape/partial/loose hierarchies: `only('box.b').focus({ skip: ['box.a'] })` (and plain `only('box.b')`) validates `box.b` exactly once while `box.a` never executes; `only(['box.a','box.b'])` runs both. Parent `only('box')` keeps existing inclusion semantics and wins over synthesized sibling skips at any depth: `only(['box.inner', 'box.inner.a'])` runs all of `box.inner`. Numeric brackets (`rows[0]`) normalize to dotted form; quoted-string brackets (`box["b"]`) are not supported and preserve empty-selection. Array, tuple, and record descents fail closed with `SchemaExclusionError` before excluded work executes. Union and composed-opaque descents are currently unresolvable (empty selection, open follow-up to make fail-closed); unknown paths and scalar descents preserve the established empty-selection behavior.

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

- Returns a focused suite, so it chains with the other focus APIs: `suite.changed('password').only('confirmPassword').run(data)`. Combining `only()` with `changed()` runs the union — the `only()` base fields plus the affected set. This is not "only b": to run exactly `b` and nothing else, use `only('b')` without `changed()`.
- Unknown changed names select nothing and fail silently: selectors accept arbitrary strings, so a misspelled `changed('pasword')` validates an empty region instead of throwing. The result then reflects retained state, not the misspelled field. There is no compile-time check for changed names in V1 — verify field names when a changed run reports no executed tests.
- Selective means non-execution: schema rules outside the affected set never run. When the schema cannot execute the affected set on its own (see above), the run throws `SchemaExclusionError` before any rule or user test executes.
- Changing a whole object selects its descendants; changing a descendant also invalidates rules that depend on that whole object. Expansion remains direct, not transitive.
- Changed names accept dotted spelling or numeric brackets. Vest normalizes `travelers[1].passportCountry` to the canonical dotted form `travelers.1.passportCountry` before planning and reporting focus. Quoted-string brackets (e.g. `box["b"]`) do not resolve to the property and preserve empty selection. Literal property names containing dots and all-numeric record keys are ambiguous in this string API and cannot be targeted as single segments — this concerns string-path addressing only; declared numeric record keys keep exact graph identity as described above.
- Without a schema, or when the schema declares no `dependsOn` edges, `changed()` degrades gracefully: the affected set is the named fields themselves, equivalent to `only()` for that run.

### Focus Composition

The core composition contract is below. `affected(a)` is the named fields plus everything the graph marks stale. This is not an exhaustive Cartesian product of nested focus and group behavior. Explicit skip precedence holds with one established exception: a changed descendant still executes under a skipped ancestor (change wins for the named field), while `only()` alone keeps inclusion semantics and never executes unselected validators as exclusions.

| Chain                                             | Result                                                                                                                                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `changed(a)`                                      | Runs `affected(a)`; schema failures narrowed to it.                                                                                                                                                                                |
| `changed(a).only(b)` or `only(b).changed(a)`      | Runs the union: `affected(a)` plus `b`, in either chain order.                                                                                                                                                                     |
| `changed([])`                                     | Runs nothing; previous failures are retained.                                                                                                                                                                                      |
| `only(b).changed([])`                             | Runs `b`; previous failures are retained.                                                                                                                                                                                          |
| `changed(undefined)`                              | Clears only changed focus. An existing `only`, skip, or group modifier remains; it is a plain run only when no other focus remains.                                                                                                |
| `changed(a).changed(b)` / `only(a).only(b)`       | The last value for that modifier wins. Other modifiers remain.                                                                                                                                                                     |
| `changed(a).only(undefined)`                      | Clears only explicit `only`; `affected(a)` still runs.                                                                                                                                                                             |
| `changed(a).focus({ onlyGroup: g })`              | Selected user tests must also belong to `g`; synthetic schema tests remain top-level.                                                                                                                                              |
| `changed(a).focus({ skipGroup: g })`              | User tests in `g` do not execute. Existing excluded group history is retained; this is not destructive field skip.                                                                                                                 |
| `only(b)` without `changed()`                     | Selects `b`; dependents are not expanded. Inclusion narrows reporting, not predicate execution: schema predicates outside `b` (especially under composition) may still execute, unlike hard `skip` exclusions which never execute. |
| `focus({ skip: s })`, with or without `changed()` | `s` is excluded from execution and follows destructive skip semantics: its retained state is cleared and its input is passed through unparsed.                                                                                     |

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

Parser steps — built-in ones like `trim()` or `toNumber()` and custom `enforce.extend` rules that return a transformed `type` — run only as part of validating a selected field. Selective runs never apply them to untouched fields, so custom transforms need no registration. See [Input vs output types with parsers](./schema_validation#input-vs-output-types-with-parsers) for the full typing story.

> No behavior change for current V1 usage `suite.changed(field).run(data)`.

## Parsed Callback Snapshot Ownership

Schema-backed runs keep the caller's input, callback data, and published result as separate ownership boundaries. For supported data containers:

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

- [Schema Validation](./schema_validation) — passing a schema to `create()` and parsed data.
- [Focused Updates](./focused_updates) — the `only()` / `skip()` / `focus()` semantics that `changed()` builds on.
- [Handling User Interaction](./dirty_checking) — the `onBlur` / `onChange` patterns where `changed()` fits.
- [Creating Custom Rules](../enforce/creating_custom_rules) — `enforce.extend`, including transforming rules.
- [Data Parsers](../enforce/builtin-enforce-plugins/data_parsers) — the built-in parser steps.

## Acceptance and interaction guarantees

The Focus Composition contract above plus the executable end-to-end example
below pin the interaction guarantees: lifecycle operations, explicitly
chosen behavior for cases the original RFC did not settle, and recovery.

## Executable end-to-end example

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
  // Focused output holds only what this run established: { note: 'ready' }.
  void repaired.value;
  // A full run establishes the complete value (e.g. on submit).
  const submitted = suite.run({
    password: 'new',
    confirm: 'new',
    note: 'ready',
  });
  return { errorsAfterChange, value: submitted.value };
}
```
