---
sidebar_position: 3
title: Schema Validation
description: Vest introduces optional schema validation using n4s (enforce).
keywords: [Vest, Schema, Validation, enforce, shape, loose, partial]
---

# Schema Validation

Vest introduces optional schema validation using `n4s` (enforce).

## Why use a Schema?

Validating data structure is often the first step in any validation pipeline. Before checking _if_ a username is available, you want to know that the `username` field actually exists and is a string.

Vest's schema support gives you:

1.  **Type Safety**: Automatically infers TypeScript types for your data, so you get autocomplete and error checking in your suite.
2.  **Structural Integrity**: Ensures your data matches the expected shape before running more complex validations.
3.  **Fail Fast**: If the data structure is wrong, Vest fails immediately, saving resources.

## Defining a Schema

Use `enforce.shape`, `enforce.loose`, or `enforce.partial` to define your data structure.

```javascript
import { create, test, enforce } from 'vest';

const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
  email: enforce.optional(enforce.isString()), // Optional field
});

const suite = create(data => {
  // `data` is typed: { username: string, age: number, email?: string | undefined }

  test('username', 'Must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });
}, userSchema);
```

`dependsOn()` declarations are invalidation metadata. They do not compare field values or create validation failures. A relationship such as `confirmPassword.dependsOn($ => $.password)` still needs a `test('confirmPassword', ...)` or Enforce rule that checks whether the values match. See [Schema Relationships](./schema_relationships).

## How it works

When you pass a schema to `create`:

1.  Vest implicitly runs the schema validation _before_ your tests.
2.  If the data structure doesn't match the schema (e.g., `age` is a string instead of a number), the suite run fails immediately for those fields.
3.  Your tests run assuming the data types are correct.

## TypeScript Inference for `create`

When a schema is passed as the second argument to `create`, Vest infers the suite callback data type and `run(...)` payload type directly from that schema.

```typescript
const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // data is inferred as: { username: string; age: number }
  test('username', () => {
    enforce(data.username).isNotBlank();
  });
}, userSchema);

// `run` payload is typed from schema
suite.run({ username: 'john', age: 42 });

// TypeScript error: `age` must be a number
// suite.run({ username: 'john', age: '42' });
```

### Input vs output types with parsers

When a schema uses [data parsers](../enforce/builtin-enforce-plugins/data_parsers.md), Vest distinguishes between the **input type** (what `suite.run()` accepts), the **draft output type** (what `suite.changed()` can return), and the **complete output type** (what a successful full run certifies in `result.value`).

```typescript
const schema = enforce.shape({
  age: enforce.isNumeric().toNumber(), // input: string | number, output: number
  name: enforce.isString().trim().toUpper(), // input: string, output: string
});

const suite = create(data => {
  // Vest 6 keeps the established complete callback type.
  // Focused runtime data can still be incomplete, so defensive narrowing is
  // recommended when this suite is run through a focus method.
  test('age', () => {
    enforce(data.age).greaterThan(0);
  });
}, schema);

// suite.run() accepts `string | number` for age (the input type)
suite.run({ age: '25', name: '  alice  ' }); // ✅ No type error

const result = suite.run({ age: '25', name: '  alice  ' });
result.value; // typed as { age: number; name: string } after a successful full run
```

The first rule in a chain determines the input type, and the last parser in the chain determines the output type. This means you never need `@ts-expect-error` or `as any` for valid parser coercion inputs.

Successful focused schema runs assemble mapped output for the suite callback. On a
first focused run, Vest applies parser steps to untouched fields without
running their validation predicates. Parser transforms should therefore be
pure and must return their declared output type even when their `pass` verdict
is false. An untouched parser's failure does not become part of that focused
run's validation result. Mapping is not validation: missing or invalid untouched
input is not proven to satisfy the schema. If schema validation fails, the
callback can receive raw input at the failing paths. Guard values before using
output-only operations, and use a full successful run before submission.
If a custom `enforce.extend` rule is a parser, register it explicitly so
focused mapping can recognize it:

```typescript
declare global {
  namespace n4s {
    interface EnforceMatchers {
      normalizeId: (value: string) => { pass: boolean; type: string };
    }
  }
}

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

Custom extension rules are treated as validators unless they are listed in
`parsers`. The per-run `result.run.data.parsed` value still reflects only the
schema work performed by that run. Because the same callback can serve full
and focused runs, properties not witnessed by the current or retained mapping
may be absent at runtime. Vest 6 preserves the callback's complete-output type
for compatibility; [the draft callback retype is planned for Vest 7](https://github.com/ealush/vest/issues/1327).
A successful full-run result still carries the complete mapped output.
Parser names are checked when `enforce.extend()` runs: they must be unique own
properties whose values are functions. Invalid registration throws
`EnforceSchemaError` before any rule is installed. Purity remains the parser
author's responsibility.

When a focused path enters an array, Vest refreshes that containing array from
the current input. Array positions are not identities, so this prevents an
insert, removal, or reorder from combining the current item with a stale array
layout retained from an earlier run. Untouched members of that array are mapped
from raw input without running their validation predicates. Parsers can run
again to refresh this mapping and must be pure.

### What becomes typed from the schema

With `create(callback, schema)`, TypeScript narrows:

- callback data (`data`) to the schema output shape, preserving Vest 6 compatibility. Focused runs may still omit untouched fields at runtime, so narrow defensively when using focus APIs.
- `suite.run(...)` / `suite.runStatic(...)` first argument to the schema input shape.
- the suite's Standard Schema surface using its existing Vest 6 contract.
- field-oriented happy-path APIs (`test`, `optional`, `include`) to schema keys.
- `result.types.input` and `result.types.output` to schema input/output types.

Some lifecycle/focus helpers (`remove`, `resetField`, `afterField`, `only`, `focus.only`) intentionally still accept dynamic strings for nested/dynamic runtime workflows.

Group modifiers (`onlyGroup` / `skipGroup`) remain `string` unless you explicitly provide group generics to `create`.

### API coverage (current typing standard)

When using `create(callback, schema)`, the current TypeScript standard is:

- Field-key inferred from schema for:
  - `test(fieldName, message?, callback)`
  - `include(fieldName).when(condition)`
  - `optional(fieldName)`
- Group generic-aware (when explicitly provided):
  - `group(groupName, callback)`
  - `suite.focus({ onlyGroup / skipGroup })`
- Intentionally dynamic string-friendly:
  - `suite.remove(fieldName)`
  - `suite.resetField(fieldName)`
  - `suite.only(fieldName)`
  - `suite.changed(fieldName)` (single name, array, or `undefined`; see [Schema Relationships](./schema_relationships#suitechanged-reference))
  - `suite.afterField(fieldName, callback)`
  - `only(fieldName)` / `skip(fieldName)` hooks

### Explicit generic override (advanced)

If needed, you can still provide explicit suite generics to fully control field/group names:

```typescript
const suite = create<'username' | 'age', 'account'>(data => {
  // Without a schema, `data` is intentionally untyped (effectively `any`).
  test('username', () => {
    enforce(data.username).isNotBlank();
  });
});

suite.focus({ onlyGroup: 'account' }); // typed group name
```

:::note Focused runs
Suite-level `only`, `skip`, and `focus` select schema fields as well as suite tests. Structural schemas can be narrowed using their metadata; rules with container validators may require a full-schema fallback. Focused validation does not establish the validity or presence of untouched input. Supply complete form data when the callback reads untouched fields.

```javascript
// Validate only the username field, enforcing the schema for 'username' while ignoring 'age'
suite.only('username').run({
  username: 'example',
});
```

For interaction-driven revalidation that also refreshes dependent fields, use `suite.changed()` instead — see [Schema Relationships](./schema_relationships).

:::

## Schema Types

- `enforce.shape({})`: Strict shape. No extra keys allowed.
- `enforce.loose({})`: Loose shape. Extra keys are ignored.
- `enforce.partial({})`: Partial shape. All keys are optional, but if present must match the type. No extra keys.
- `enforce.isArrayOf(rule)`: Validates an array where every item matches the rule.

## Inspecting schema results

The suite result includes typed properties for accessing validated and parsed data:

- `result.value` — The parsed output when the suite is valid. Full runs and existing `only()` / `focus()` / `get()` surfaces retain Vest 6's complete-output type. The new `changed()` result uses the draft output type because required properties may be absent. `undefined` when invalid.
- `result.types.input` — Carries the schema's input type for static analysis. At runtime, holds the parsed output value.
- `result.types.output` — Carries the schema's output type. At runtime, holds the parsed output value.
- `result.run.data.raw` — The current run's parsed chunk when schema validation succeeds, or its original input when validation fails. A focused callback may receive a fuller retained mapped output than this per-run metadata.
- `result.run.data.parsed` — Parsed data for the current run.

```typescript
const schema = enforce.shape({
  score: enforce.isNumeric().toNumber(),
});

const suite = create(data => {
  test('score', () => {
    enforce(data.score).greaterThan(0);
  });
}, schema);

const result = suite.run({ score: '42' });
result.value; // { score: 42 }
result.types?.output; // { score: 42 }
result.run.data.raw; // { score: 42 }
result.run.data.parsed; // { score: 42 }
```

## Schema Parsing

Schema rules support built-in [data parsers](../enforce/builtin-enforce-plugins/data_parsers.md) that transform values as part of validation. When a schema uses parsers, `suite.run()` receives the transformed data in the callback, and `result.value` contains the parsed output.

```js
import { create, test, enforce } from 'vest';

const schema = enforce.shape({
  name: enforce.isString().trim().toTitle(),
  age: enforce.isNumeric().toNumber().clamp(0, 120),
});

const suite = create(data => {
  // data is already parsed: { name: 'Jane Doe', age: 120 }
  test('name', 'Name is required', () => {
    enforce(data.name).isNotBlank();
  });
}, schema);

const result = suite.run({ name: '  jANE DOE ', age: '180' });
// result.value → { name: 'Jane Doe', age: 120 }
```
