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

:::note Focused runs
When you focus the suite with `focus({ only })`, schema validation is skipped for fields outside the focus scope. This allows you to validate a single field even if the full payload does not satisfy the schema.

```javascript
// Validate only the username field
suite.focus({ only: 'username' }).run({
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

The suite result includes a `types` object that captures the validated `input` and coerced `output` from the schema run. This is useful for debugging and type-safe consumers.

## Parsing data with schema

Every n4s schema rule now exposes `parse(input)`, which validates and returns the schema output type. This allows coercion-style rules to transform incoming values and gives you a strongly typed parsed object.

When you pass a schema to `create`, Vest runs with that parsed output as the first argument of your suite callback.

```javascript
import { create, test, enforce } from 'vest';

enforce.extend({
  toNumber: value => {
    const parsed = Number(value);
    return Number.isNaN(parsed)
      ? { pass: false, type: value }
      : { pass: true, type: parsed };
  },
});

const schema = enforce.shape({
  age: enforce.toNumber(),
});

const suite = create(data => {
  // data.age is the parsed output (number)
  test('age', () => {
    enforce(data.age).isNumber();
  });
}, schema);

suite.run({ age: '42' });
```
