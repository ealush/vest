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

When a schema uses [data parsers](../enforce/builtin-enforce-plugins/data_parsers.md), Vest distinguishes between the **input type** (what `suite.run()` accepts) and the **output type** (what the callback receives and what `result.value` contains).

```typescript
const schema = enforce.shape({
  age: enforce.isNumeric().toNumber(), // input: string | number, output: number
  name: enforce.isString().trim().toUpper(), // input: string, output: string
});

const suite = create(data => {
  // data.age is typed as `number` (the output type)
  test('age', () => {
    enforce(data.age).greaterThan(0);
  });
}, schema);

// suite.run() accepts `string | number` for age (the input type)
suite.run({ age: '25', name: '  alice  ' }); // ✅ No type error

const result = suite.run({ age: '25', name: '  alice  ' });
result.value; // typed as { age: number; name: string }
```

The first rule in a chain determines the input type, and the last parser in the chain determines the output type. This means you never need `@ts-expect-error` or `as any` for valid parser coercion inputs.

### What becomes typed from the schema

With `create(callback, schema)`, TypeScript narrows:

- callback data (`data`) to the schema input shape.
- `suite.run(...)` / `suite.validate(...)` first argument to the schema input shape.
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
When you focus the suite with `suite.only()`, `suite.skip()`, or `suite.focus()`, Vest intelligently subsets your validation schema under the hood using `enforce.pick` and `enforce.omit`. This ensures that schema validation still runs securely for the fields in focus—and provides correct types in the test callback!—while safely ignoring un-focused fields and allowing you to validate partial payloads effectively.

```javascript
// Validate only the username field, enforcing the schema for 'username' while ignoring 'age'
suite.only('username').run({
  username: 'example',
});
```

:::

## Schema Types

- `enforce.shape({})`: Strict shape. No extra keys allowed.
- `enforce.loose({})`: Loose shape. Extra keys are ignored.
- `enforce.partial({})`: Partial shape. All keys are optional, but if present must match the type. No extra keys.
- `enforce.isArrayOf(rule)`: Validates an array where every item matches the rule.

## Inspecting schema results

The suite result includes typed properties for accessing validated and parsed data:

- `result.value` — The parsed output when the suite is valid. Typed as the schema's output type. `undefined` when invalid.
- `result.types.input` — Carries the schema's input type for static analysis. At runtime, holds the parsed output value.
- `result.types.output` — Carries the schema's output type. At runtime, holds the parsed output value.
- `result.run.data.raw` — The current run data passed into the suite callback (parsed when schema validation succeeds; original input when it fails).
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

## Structured schema issues

Use `.issue()` immediately after a schema rule to give that failure a stable
code and message. `n4s` derives safe metadata from the rule and `shape` derives
the nested path:

```typescript
const schema = enforce.shape({
  account: enforce.shape({
    password: enforce
      .isString()
      .issue({ code: 'not_string', message: 'Password must be text' })
      .longerThanOrEquals(12)
      .issue({
        code: 'too_short',
        message: 'Password must contain at least 12 characters',
      }),
  }),
});
```

For the value `{ account: { password: 'secret' } }`, the issue is:

```javascript
{
  code: 'too_short',
  message: 'Password must contain at least 12 characters',
  path: ['account', 'password'],
  meta: {
    rule: 'longerThanOrEquals',
    minimum: 12,
    inclusive: true,
    actual: { type: 'string', length: 6 },
  },
}
```

Metadata derivation intentionally excludes rejected values and opaque rule
arguments. This prevents passwords, tokens, equality targets, and custom rule
configuration from leaking into logs or API responses. Rules without a known
safe metadata mapping still include the rule name.

Structured issues are returned by `schema.validate()`, and when the schema is
passed to `create()`, Vest preserves them on `result.errors` and
`result.issues`. Existing `.message()` and string-based result selectors remain
supported.

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
