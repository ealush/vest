---
title: Schema Relationships and Changed Runs
description: Declare direct field dependencies and validate the fields affected by a change.
keywords: [schema relationships, dependsOn, changed, dependent validation]
---

# Schema Relationships and Changed Runs

Declare a dependency on the schema rule whose result can change when another field changes. Then use `suite.changed()` at the event boundary to check the named field and its direct dependents.

A relationship declared on the schema is data, not code hidden in a test closure. Vest's runtime uses it to decide what a change invalidates, `schema.describe()` exposes it as JSON for tools and coding agents, and an unknown reference fails as soon as the suite is created. The schema says which fields are related; the suite's tests still say why and how.

```ts
import 'vest/relationships';
import { create, enforce, test } from 'vest';

export const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().dependsOn($ => $('password')),
});

export const suite = create(data => {
  test('confirm', 'Passwords do not match', () => {
    enforce(data.confirm).equals(data.password);
  });
}, schema);

export const result = suite.changed('password').run(formData);
```

The changed run checks `password` and `confirm`. A previous error on an unrelated field remains in the suite result until that field is checked again.

User tests are selected by name, so name each test after the data path it validates (`confirm`, `rows.5.state`). The names passed to `changed()` always run, even when they are not schema fields, so a test for a field outside the schema still runs when that field changes.

A changed run only checks part of the data, so its `valid` can be `true` while an unchecked field is still invalid. For final submission, run the whole suite and await it if it has async tests:

```ts
const complete = await suite.run(formData);
```

## Declare paths

Inside a shape, `$` refers to fields in the same shape. Use `$.root` to refer to a top-level field from an array item or nested shape:

```ts
export const schema = enforce.shape({
  currency: enforce.isString(),
  rows: enforce.isArrayOf(
    enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $('country')),
      price: enforce.isNumber().dependsOn($ => $.root('currency')),
    }),
  ),
});

export const rowSuite = create(() => {}, schema);
rowSuite.changed('rows.5.country').run(data); // selects country and state in row 5
rowSuite.changed('currency').run(data); // selects currency and every row's price
```

`dependsOn()` returns a new rule with an independent validation chain and message. It leaves the rule it was called on unchanged, so a shared rule constant can be reused safely, including when you add validators to the returned rule. Use the returned rule in the schema:

```ts
const text = enforce.isString();

const schema = enforce.shape({
  password: text,
  username: text, // no dependency
  confirm: text.dependsOn($ => $('password')),
});
```

Relationships are **direct**: if `c` depends on `b` and `b` depends on `a`, changing `a` checks `a` and `b`. Declare a direct dependency from `c` to `a` when that change can affect `c` too. A dependency resolver must return a field reference (or an array of references). References are checked twice:

- **At compile time,** the shape that contains the rule checks each `$('name')` against its own keys, and deeper segments against that field's data. A typo is a type error on the offending field: `"confirm" depends on unknown field "pasword"`. Declare `dependsOn()` last in the rule's chain to keep this check, because rules chained after it return their own types. A field built from alternatives (`anyOf()` and the other compound rules) accepts a key of any alternative. `$.root('name')` references and dynamic names (`$(name)` where `name` is typed `string`) are checked at runtime only, since a nested shape does not know its root and a dynamic name is not known at compile time.
- **At runtime,** with `vest/relationships` imported, `create()` resolves the graph and throws an `EnforceSchemaError` for any unknown reference, with a suggestion when the name looks like a typo. Suites created before the entry was imported report it on their first changed run.

A dependency on an object or array is also affected by a change inside it. For example, a rule that depends on `$('address')` is selected by `changed('address.city')`. Naming the entire object selects its declared descendants as well. Dependents use canonical dotted test names such as `rows.5.state`; numeric brackets are accepted in changed names and skip comparisons.

`$('name')` references a field in the same shape, `$('address', 'city')` a path below it, and `$.root('name')` a top-level field. Any field name works, including `root`, `parent` and `then`. There is no parent scope: use `$.root` for a field outside the current shape.

```ts
enforce.shape({
  root: enforce.isString(),
  address: enforce.shape({ city: enforce.isString() }),
  zip: enforce.isString().dependsOn($ => [$('address', 'city'), $('root')]),
});
```

Declarations and references work inside `shape`, `loose`, `partial`, `pick`, `omit`, `optional`, `compose`, `isArrayOf`, `record`, `tuple`, the compound rules (`anyOf`, `allOf`, `oneOf`, `noneOf`) and `lazy()`. A declaration belongs to a field: the root schema itself cannot call `dependsOn()`, because it has no name to focus and every change already reaches it. Declare the dependency on the field whose result changes; describing a root declaration throws an `EnforceSchemaError`. A schema path cannot describe unbounded depth, so `dependsOn()` inside a recursive `lazy()` schema throws an `EnforceSchemaError`. Recursive schemas without declarations must reuse a schema instance. Graph discovery supports at most 32 nested `lazy()` expansions; exceeding this limit throws instead of silently omitting deeper dependencies.

Finalize schema definitions and dependency resolvers before the first `describe()` or changed run. Graphs are cached for that schema instance; create a new schema when its structure or declarations need to change. Use own enumerable data properties for schema definitions; accessor-defined rules cannot be inspected for dependencies. Resolver callbacks describe configuration and should be pure. Describing a graph resolves `lazy()` factories once, but executes no validation rules, parsers or input getters.

## Relationship patterns

A reusable nested schema declares its relationships relative to itself, and they follow it wherever it is mounted:

```ts
import 'vest/relationships';
import { enforce } from 'vest';

const address = enforce.shape({
  country: enforce.isString(),
  state: enforce.isString().dependsOn($ => $('country')),
});

export const checkout = enforce.shape({
  billing: address,
  shipping: address,
});
// billing.country → billing.state, shipping.country → shipping.state
```

Nested collections keep each relationship inside its own member. Combine local references with `$.root` for a top-level field:

```ts
import 'vest/relationships';
import { enforce } from 'vest';

export const cart = enforce.shape({
  promoCode: enforce.isString(),
  orders: enforce.isArrayOf(
    enforce.shape({
      items: enforce.isArrayOf(
        enforce.shape({
          price: enforce.isNumber(),
          discount: enforce
            .isNumber()
            .dependsOn($ => [$('price'), $.root('promoCode')]),
        }),
      ),
    }),
  ),
});
// orders.*.items.*.price → the same item's discount
// promoCode → every item's discount
```

Relationships may form cycles. They describe invalidation, not calls, so a change still checks one hop:

```ts
import 'vest/relationships';
import { enforce } from 'vest';

export const stay = enforce.shape({
  checkIn: enforce.isString().dependsOn($ => $('checkOut')),
  checkOut: enforce.isString().dependsOn($ => $('checkIn')),
});
// changed('checkIn') checks checkIn and checkOut, and so does changed('checkOut')
```

A section that may be absent declares its relationships the same way. The schema records the relationship even when the business rule that reads the related field lives only in a suite test:

```ts
import 'vest/relationships';
import { enforce } from 'vest';

export const account = enforce.shape({
  accountType: enforce.isString(),
  company: enforce.optional(
    enforce.shape({
      country: enforce.isString(),
      taxId: enforce
        .isString()
        .dependsOn($ => [$('country'), $.root('accountType')]),
    }),
  ),
});
// company.country → company.taxId, accountType → company.taxId
```

A relationship does not need a schema rule that reads the related field. Here the username's schema rule only checks its type, while an async suite test asks the server whether the name is free in the selected organization. The schema records that the result depends on the organization; the suite says how:

```ts
import 'vest/relationships';
import { create, enforce, test } from 'vest';

export const signup = enforce.shape({
  organizationId: enforce.isString(),
  username: enforce.isString().dependsOn($ => $('organizationId')),
});

export const signupSuite = create(data => {
  test('username', 'Username is taken', async () => {
    const { available } = await checkUsername(
      data.organizationId,
      data.username,
    );
    enforce(available).isTruthy();
  });
}, signup);
// changed('organizationId') reruns the username availability check
```

## Focus and schema results

`changed()` accepts a field name or an array of names. It composes with `only()` and `focus()` in either order, and a later `changed()` call replaces the earlier selection rather than adding to it. Explicit `only()` fields join the affected set; `skip` excludes a field and its descendants even when a dependency selects them. `changed([])` selects no fields itself and keeps previous results, including for schemas that otherwise require whole-schema validation. The suite callback still executes, and explicit `include()` hooks keep their ordinary focus behavior. `changed(undefined)` clears the changed focus.

User tests run for the affected names. Schema validation currently runs each affected **top-level field** separately, with n4s's usual parent context and parsing behavior. For example, `changed('rows.5.country')` can also report an invalid sibling in `rows`, because the `rows` schema rule validates the whole array. A schema that cannot be safely split into fields, such as a composed or `partial()` root, runs as a whole. Schema errors found outside the affected names are reported, but the user tests for those fields do not run. Skipped schema errors keep their prior verdict. The schemas inside each selected top-level field still fail fast, so this does not promise an exhaustive list of failing descendants.

Group focus keeps Vest's ordinary reporting rules. Schema failure tests have no group, so `onlyGroup` can filter their reporting even though schema validation runs. A filtered failing schema can therefore produce an invalid result with empty `errors` and `issues` lists. Use an unfiltered complete run for submission.

Other suite schemas must provide synchronous `parse()` or `run()` methods. A foreign object implementing only Standard Schema's `~standard.validate` is not a supported suite schema, and asynchronous schema parsing is unsupported. Vest's own Standard Schema export remains available for complete submission validation.

The passing `value` from a changed run contains only the fields it validated, parsed by their schema rules. Changed results are typed as partial parsed schema output. A changed selection that might be undefined uses the same partial type. An empty selection returns `{}`, including for an array or scalar root; the partial output types include the empty object and require narrowing. Ordinary `only()`, `focus()`, `suite.get()`, `run()` and `runStatic()` keep their existing output types, and clearing changed focus with `changed(undefined)` returns the ordinary focused types. The suite callback input of a changed run is best effort: the validated fields are parsed and the other fields are kept as they were passed in, and when schema validation fails the callback receives the raw input. Unlike `only()` and `focus()`, a changed run does not parse the whole input, so that it costs only the selected fields. Run the whole suite before relying on parsed output; see [Typed Schemas](./typed-schemas.md). Validated output is a shallow snapshot taken before the callback runs; treat nested parsed objects as immutable.

Field and test names use dotted paths. Literal dots in object keys are ambiguous with nested names for focus and issue paths; prefer keys without dots.

Async changed runs use the usual suite lifecycle: await the returned result before applying errors, and a newer run supersedes a pending result from the same suite. Keep one suite instance per form so retained state stays with that form.

## Inspect the graph

`vest/relationships` re-exports `resolveAffected`, `EnforceSchemaError` and the graph and reference types, so an application that depends on `vest` alone can declare and inspect relationships. For n4s-only code, import `n4s/relationships` to enable `schema.describe()` and `resolveAffected()`:

```ts
import 'n4s/relationships';
import { enforce } from 'n4s';
import { resolveAffected } from 'n4s/relationships';

const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().dependsOn($ => $('password')),
});

export const description = schema.describe();
// { relationships: [{ source: ['password'], target: ['confirm'], effect: 'invalidate' }] }

export const affected = resolveAffected(schema, ['password'], {
  password: 'a',
  confirm: 'a',
});
// [['password'], ['confirm']]
```

The description is plain JSON. Each relationship reads "when the value at `source` changes, the current result at `target` may be stale". In a path, a string is a shape key or tuple position, and `{ type: 'item', binding }` stands for every member of a collection; `binding` is `isArrayOf` for arrays (numeric indexes) and `record` for records (string keys). Item identity is positional: a source and target that share a path up to and including an item segment refer to the same member. In the rows example above, `['rows', item, 'country'] → ['rows', item, 'state']` relates each row's country to the state of that same row.

`import 'vest/relationships'` also enables the n4s graph for Vest suites. Without the relevant opt-in import, calling `suite.changed(...).run(...)` or `schema.describe()` throws a setup error naming the required entry. Load `vest` and `vest/relationships` in the same module format (both ESM or both CommonJS); a mixed setup loads two copies of Vest and the import does not reach the suite.

`resolveAffected()` accepts a field name or an array of names and ignores unknown or unsafe schema paths. In its paths, array items are numbers, while shape keys and tuple positions are strings, as in `describe()`. `suite.changed()` still selects user tests whose names were explicitly passed, including names absent from the schema. It does not check that every requested user-test name exists. Planning expands each dependency edge once per run, so naming a large container (or a member of one whose dependents depend on the container) costs a single pass over the current data.

## Describe a suite

`schema.describe()` covers the relationships declared on the schema. A suite adds its own: the tests it registers and the `include().when()` declarations in its callback. `describeSuite(suite)` from `vest/relationships` returns the whole picture as data, for tools, devtools and coding agents:

```ts
import { describeSuite } from 'vest/relationships';

signupSuite.run(formData);
export const description = describeSuite(signupSuite);
// {
//   relationships: [{ source: ['organizationId'], target: ['username'], effect: 'invalidate' }],
//   tests: [{ fieldName: 'username' }],
//   includes: [],
//   dynamicIncludes: [],
//   untested: [],
// }
```

- `relationships` is the schema's graph, as `schema.describe()` returns it.
- `tests` lists the tests of the last run, with the group each belongs to.
- `includes` lists `include(target).when(source)` declarations; `dynamicIncludes` lists the targets of `include()` declarations whose condition is a function or value rather than a field name.
- `untested` lists relationship targets that no test of the last run covers. Their schema rules still run, but no user test checks them.

Suites register tests while they run, so `describeSuite()` describes the last run and runs no tests itself. Create the suite after importing `vest/relationships`; describing a suite created earlier throws a setup error.
