---
sidebar_position: 4
title: Schema Relationships
description: Declare validation relationships between fields in Enforce schemas.
keywords: [Vest, Enforce, Schema, Relationships, dependsOn, revalidates, cross-field]
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

`dependsOn` is the first relationship primitive. The internal representation is a single directed graph (`source → target`, `effect: 'invalidate'`) that can later host `revalidates` and other effects without redesigning the schema API.

A relationship declaration should be: type-safe (or runtime + ESLint safe), refactor-safe, composable through nested schemas, meaningful for repeated/array schemas (same-item scoped), machine-readable without parsing source, small enough that users are not maintaining a second copy of their form, colocated with the field it describes, useful to Vest itself (not just metadata), and extensible.

## Cross-field Dependencies

Sometimes validating one field depends on another.

For example, `confirmPassword` must be validated again whenever `password` changes.

Declare that relationship **inline on the field schema** — references are resolved by the containing schema:

```ts
const registrationSchema = enforce.shape({
  email: enforce.isString().isEmail(),
  password: enforce.isString().longerThanOrEquals(8),
  confirmPassword: enforce
    .isString()
    .dependsOn($ => $.password),
});
```

`$` does not contain your form values.

It is a typed (or structurally-checked) reference to sibling fields in the **current schema scope**.

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

The schema says *that* the two fields are related; the suite says *why and how*. This works equally for equality checks, conditional business rules, async API checks, feature-flagged validation, and warnings. The schema never encodes execution logic.

So a field can declare a dependency even when its own Enforce rule is not the one reading the other field:

```ts
username: enforce
  .isString()
  .dependsOn($ => $.organizationId)
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
    .dependsOn($ => [
      $.quantity,
      $.unitPrice,
      $.currency,
    ]),
});
```

Changing any of `quantity`, `unitPrice`, or `currency` may make `total` stale. Always return refs — `($) => $.a` for one, `($) => [$.a, $.b]` for many — so the API has room to grow.

## Nested Fields — Scoped Refs

`$` is scoped to the **current schema**. References are local by default:

```ts
const accountSchema = enforce.shape({
  password: enforce.isString(),
  confirmPassword: enforce
    .isString()
    .dependsOn($ => $.password),
});
```

No dotted strings to keep synchronized. Renaming `password` is caught at the `dependsOn` line (or at schema composition with a runtime/ESLint error).

## Reusable Nested Schemas

Dependencies declared inside a nested schema are relative to that schema and **rebase automatically** when mounted:

```ts
const addressSchema = enforce.shape({
  country: enforce.isString(),
  state: enforce
    .isString()
    .dependsOn($ => $.country),
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
  passportNumber: enforce
    .isString()
    .dependsOn($ => $.passportCountry),
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

## Dependencies Across Nesting Levels

Most relationships are local. For the unusual case that must reference outside its scope, use `$.root`:

```ts
const schema = enforce.shape({
  accountType: enforce.isString(),
  company: enforce.shape({
    country: enforce.isString(),
    taxId: enforce
      .isString()
      .dependsOn($ => [
        $.country,
        $.root.accountType,
      ]),
  }),
});
```

Semantics:

* `$` — current schema scope
* `$.root` — top-level schema scope

`$.root` should be explicit and rare. Reusable locals should prefer local refs.

> **Deferred to v2 — `$.parent`**
>
> `$.parent` (parent-scope escape) is **intentionally deferred** — add only if a real use case demands it.
> In V1, accessing `$.parent` throws `Error('$.parent deferred to v2')` instead of returning `undefined`.
> ```ts
> // @deferred v2 — throws in V1
> $.parent.sibling // Error('$.parent deferred to v2')
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
confirmPassword: enforce.isString().dependsOn($ => $.password)
```

Vest derives:

```text
password
confirmPassword
```

as the affected set. This preserves `only()` semantics while giving frameworks an interaction-aware operation. Keep them separate:

* `only()` — explicit execution selection
* `changed()` / `invalidate()` — dependency-aware affected-set selection

`include()` then becomes a lower-level escape hatch, not the primary way to express cross-field behavior.

## Dependencies Are Not Automatically Transitive

```text
A → B
B → C
```

where `A → B` means "target `B` may be stale when `A` changes."

If `A` changes, `B` must be reconsidered. `C` does not — `B`'s value didn't change. Expansion is on changed values, not transitive closure. If `C` also depends on `A`, declare it explicitly.

## Circular Dependencies

Cycles are valid.

```ts
const schema = enforce.shape({
  startDate: enforce.isString().dependsOn($ => $.endDate),
  endDate: enforce.isString().dependsOn($ => $.startDate),
});
```

Changing `startDate` invalidates `endDate` and vice versa. No loop occurs because dependencies describe invalidation, not imperative calls.

## Revalidates — Source-Oriented Alias

`dependsOn` is target-oriented, `revalidates` is source-oriented — same edge in V1:

```ts
// target-oriented:
confirmPassword: enforce.isString().dependsOn($ => $.password)
// source-oriented (same edge):
password: enforce.isString().revalidates($ => $.confirmPassword)
// both → { source: ['password'], target: ['confirmPassword'], effect: 'invalidate' }
```

> **Deferred to v2 — `effect: 'revalidate'`**
>
> V1: only `effect: 'invalidate'` ("previous result is stale") is supported.
> Supplying `effect: 'revalidate'` (immediately rerun vs stale) is **deferred to v2** and will throw `Error("effect:'revalidate' deferred to v2")` in V1.
> The assertion is at composition time (`enforce` + `lazy.ts`):
> ```ts
> /** @deferred v2 — effect:'revalidate' deferred, only 'invalidate' supported in V1 */
> if (effect !== 'invalidate') throw new Error(`effect:'${effect}' deferred to v2`)
> ```
> Future `revalidate` vs `invalidate` distinction (immediately rerun vs stale) is deferred.

## Introspection

Dependency information is part of the Enforce schema and inspectable without running a suite:

```ts
schema.describe();
```

Serializable form:

```json
{
  "dependencies": [
    { "target": ["confirmPassword"], "sources": [["password"]] }
  ]
}
```

Array item:

```json
{
  "target": ["travelers", { "item": "traveler" }, "passportNumber"],
  "sources": [["travelers", { "item": "traveler" }, "passportCountry"]]
}
```

The representation is:

```ts
type PropertySegment = { type: 'property'; key: PropertyKey };
type ItemSegment     = { type: 'item'; binding: string };
type SchemaPath      = readonly (PropertySegment | ItemSegment)[];
interface SchemaRelationship {
  source: SchemaPath;
  target: SchemaPath;
  effect: 'invalidate';
  metadata?: { reason?: string };
}
interface SchemaDependency { target: SchemaPath; sources: readonly SchemaPath[]; }
```

Consumable by Vest, framework adapters, devtools, docs, and agents. Relationships stay out of `~standard`.

## What Dependencies Intentionally Do Not Do

* Does not inspect suite closures.
* Does not make arbitrary JS declarative.
* Does not replicate `test()`/`group()`/`warn()`/`only()`/`skipWhen`/async inside Enforce.
* Does not require deps for every cross-field test.
* Does not change Standard Schema.
* Does not change `only()` — `changed()` is separate.

## Interaction with Other Features

Schema Relationships are **metadata + `suite.changed()` in V1**. `describe()` records the graph without running a suite; `suite.changed()` consumes it to select affected tests.

| Feature | Effect on `describe()` | Effect on suite `run()` / `suite.changed()` in V1 |
|---|---|---|
| `skipWhen` (retains) | records | `run()` unchanged; `changed()` treats dependent as candidate but Vest skips if `skipWhen` hides it |
| `omitWhen` (removes) | records | `run()` unchanged; `changed()` still records edge but omitted test never runs |
| `optional('field')` | records | `run()` unchanged — edge exists even if optional field is absent; `changed()` includes it when source changes |
| `include().when()` | **does not record** — `include` is a Vest suite modifier, not an n4s schema relationship; `schema.describe()` has no `include` metadata; `changed()` remains the interaction-aware operation |
| `only` / `skip` / `onlyGroup` / `skipGroup` | records | **not affected** — `only('password')` does not auto-include `confirmPassword`; `changed('password')` does |
| `group` / `each` | records (rebased) | `run()` unchanged; `changed()` respects rebasing and same-item scoping |
| `warn` | records | `run()` unchanged; `changed()` includes warn dependents as normal tests |

V1 ships `suite.changed(field).run(data)` with dependency-aware affected-set expansion (flat, nested, reusable, array same-item, and root→array fan-out via run-time `data`). Only the `signal` overload is deferred:

> **Deferred to v2 — `suite.changed(field, { signal: AbortSignal })`**
>
> AbortSignal-based cancellation for `suite.changed` is **deferred to v2**.
> In V1, calling `suite.changed(field, { signal })` throws `Error('suite.changed({ signal: AbortSignal }) deferred to v2')`.
> ```ts
> /** @deferred v2 — suite.changed AbortSignal support deferred */
> suite.changed('username', { signal: controller.signal }).run(data); // throws in V1
> ```
> No behavior change for current V1 usage `suite.changed(field).run(data)` — only the signal overload is deferred.
