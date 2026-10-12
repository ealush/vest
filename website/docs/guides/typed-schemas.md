---
title: Typed Schemas and Parsed Results
description: Parse form input, use the typed value in your suite, and read it from the result.
keywords:
  [Vest TypeScript schema, parsed validation, Enforce schema, Standard Schema]
---

# Typed Schemas and Parsed Results

An Enforce schema can parse the input before the suite's tests run. Pass it as the second argument to `create`; the suite callback receives the parsed type and a successful result exposes the parsed value.

## Define input and output together

```ts
import { create, enforce, test } from 'vest';

const registrationSchema = enforce.shape({
  age: enforce.isNumeric().toNumber(),
  newsletter: enforce.isBoolean(),
  username: enforce.isString().trim(),
});

export const registrationSuite = create(data => {
  // `data` is parsed output: age is a number and username is trimmed.
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('age', 'You must be at least 18', () => {
    enforce(data.age).greaterThanOrEquals(18);
  });
}, registrationSchema);
```

The first rule in a parser chain determines the accepted input type. The final parser determines the output type. Here, `age` accepts a numeric string or number, while the suite callback receives a number.

## Read the parsed result

```ts
const result = registrationSuite.run({
  age: '36',
  newsletter: true,
  username: '  Ada  ',
});

if (result.isValid()) {
  result.value;
  // { age: 36, newsletter: true, username: 'Ada' }
}
```

Use `result.value` only after a successful result. Invalid and pending results do not expose a valid parsed output.

## Focused runs and best-effort output

`only()` and `focus()` run the user tests for the focused fields and report schema errors only for those fields. When the whole input passes the schema, the suite callback and a successful result still receive the complete parsed output, at the cost of parsing the whole input once.

When a field outside the focus fails the schema, it keeps its previous verdict and is not reported. The output is then best effort: the focused fields are parsed and the others are kept as they were passed in. A focused run does not sanitize the fields it leaves out, so run the whole suite before relying on `result.value`, for example on submission. A retained failure stays until its field is checked again, even when a later focused run parsed the whole input successfully: focus keeps the verdicts of the fields it leaves out.

When the schema rejects the input, the suite callback receives the input as it was passed in, so your tests can still run and report their messages. The callback's parameter type describes the parsed output, so a field that failed parsing can still hold its original form inside a test.

## Keep the execution APIs distinct

| Situation                                  | API                                      |
| ------------------------------------------ | ---------------------------------------- |
| Interactive validation with retained state | `registrationSuite.run(data)`            |
| Independent server request                 | `registrationSuite.runStatic(data)`      |
| Compatible library expects Standard Schema | Pass `registrationSuite` to that library |

Standard Schema consumers invoke the suite's `~standard.validate` hook. Application code should continue using `run()` or `runStatic()` because those return Vest's full result with warnings, pending state, groups, focus, and selectors.

When implementing or testing a Standard Schema adapter directly, the contract is available explicitly:

```ts
const output = await registrationSuite['~standard'].validate({
  age: '36',
  newsletter: true,
  username: '  Ada  ',
});
```

Successful Standard Schema output contains the parsed values, so `output.value.age` is a number.

## Using another schema library

Enforce can parse your API boundary, but it does not have to. If your application already uses Zod, Valibot, or another schema library there, keep it and use Vest for validation during interaction.

Read [form and schema library integration](./form-and-schema-integration.md), the [Standard Schema reference](../community_resources/standard_schema.md), and the [production registration architecture](./production-architecture.md) for complete compositions.
