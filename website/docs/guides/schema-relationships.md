---
title: Schema Relationships and Changed Runs
description: Declare direct field dependencies and validate the fields affected by a change.
keywords: [schema relationships, dependsOn, changed, dependent validation]
---

# Schema Relationships and Changed Runs

Declare a dependency on the schema rule whose result can change when another field changes. Then use `suite.changed()` at the event boundary to check the named field and its direct dependents.

```ts
import 'vest/relationships';
import { create, enforce, test } from 'vest';

const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().dependsOn($ => $.password),
});

const suite = create(data => {
  test('confirm', 'Passwords do not match', () => {
    enforce(data.confirm).equals(data.password);
  });
}, schema);

const result = suite.changed('password').run(formData);
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
const schema = enforce.shape({
  currency: enforce.isString(),
  rows: enforce.isArrayOf(
    enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
      price: enforce.isNumber().dependsOn($ => $.root.currency),
    }),
  ),
});

const rowSuite = create(() => {}, schema);
rowSuite.changed('rows.5.country').run(data); // selects country and state in row 5
rowSuite.changed('currency').run(data); // selects currency and every row's price
```

`dependsOn()` returns a new rule and leaves the rule it was called on unchanged, so a shared rule constant can be reused safely. Use the returned rule in the schema:

```ts
const text = enforce.isString();

const schema = enforce.shape({
  password: text,
  username: text, // no dependency
  confirm: text.dependsOn($ => $.password),
});
```

Relationships are **direct**: if `c` depends on `b` and `b` depends on `a`, changing `a` checks `a` and `b`. Declare a direct dependency from `c` to `a` when that change can affect `c` too. A dependency resolver must return a field reference (or an array of references); an unknown field produces an error when the graph is first described or a changed run begins.

`$.root` and `$.parent` are reserved, and `then` cannot be read from a proxy. Use `FIELD` from `n4s/relationships` to reference a field with one of those names:

```ts
import { FIELD } from 'n4s/relationships';

enforce.isString().dependsOn($ => $[FIELD]('root'));
```

Declarations and references work inside `shape`, `loose`, `partial`, `pick`, `omit`, `optional`, `compose`, `isArrayOf`, `record`, `tuple`, the compound rules (`anyOf`, `allOf`, `oneOf`, `noneOf`) and `lazy()`. A schema path cannot describe unbounded depth, so `dependsOn()` inside a recursive `lazy()` schema throws an `EnforceSchemaError`. Recursive schemas without declarations are fine.

## Focus and schema results

`changed()` accepts a field name or an array of names. It composes with `only()` and `focus()` in either order. Explicit `only()` fields join the affected set; `skip` excludes a field even when a dependency selects it. `changed([])` runs no fields and keeps previous results. `changed(undefined)` clears the changed focus.

User tests run for the affected names. Schema validation currently runs each affected **top-level field** separately. For example, `changed('rows.5.country')` can also report an invalid sibling in `rows`, because the `rows` schema rule validates the whole array. A schema that cannot be safely split into fields, such as a composed, `partial()` or non-n4s root, runs as a whole. Schema errors found outside the affected names are reported, but the user tests for those fields do not run.

The passing `value` from a changed run contains only the fields it validated, parsed by their schema rules, and is typed as a partial schema output. As with `only()`, the suite callback receives the input with the validated fields parsed and the other fields as they were passed in.

Async changed runs use the usual suite lifecycle: await the returned result before applying errors, and a newer run supersedes a pending result from the same suite. Keep one suite instance per form so retained state stays with that form.

## Inspect the graph

For n4s-only code, import `n4s/relationships` to enable `schema.describe()` and `resolveAffected()`:

```ts
import 'n4s/relationships';
import { enforce } from 'n4s';
import { resolveAffected } from 'n4s/relationships';

const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce.isString().dependsOn($ => $.password),
});

schema.describe().relationships;
// [{ source: ['password'], target: ['confirm'], effect: 'invalidate' }]

resolveAffected(schema, ['password'], { password: 'a', confirm: 'a' });
// [['password'], ['confirm']]
```

`import 'vest/relationships'` also enables the n4s graph for Vest suites. Without the relevant opt-in import, calling `suite.changed(...).run(...)` or `schema.describe()` throws a setup error naming the required entry. Load `vest` and `vest/relationships` in the same module format (both ESM or both CommonJS); a mixed setup loads two copies of Vest and the import does not reach the suite.
