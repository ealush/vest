---
title: Use Vest with Form and Schema Libraries
description: Let form managers own inputs while Vest can manage progressive validation state and parse submitted data with Enforce schemas.
keywords: [React Hook Form Vest, Zod Vest, Standard Schema, form integration]
---

# Use Vest with Form and Schema Libraries

Vest does not need to replace the other validation-related tools in an application.

| Layer                                 | Owns                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Form manager                          | Values, registration, events, and submission mechanics                           |
| Vest suite                            | Focused execution, retained results, dependencies, pending work, and async races |
| Enforce schema or another schema tool | Parsing, transforming, and protecting the final submitted payload                |

An Enforce schema is part of Vest, so Vest can own both validation over time and the parsed boundary. A separate schema library is optional.

## React Hook Form through Standard Schema

Vest suites implement Standard Schema. React Hook Form's official resolver package provides a Standard Schema adapter:

```ts
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm } from 'react-hook-form';
import { registrationSuite } from './registrationSuite';

const form = useForm({
  resolver: standardSchemaResolver(registrationSuite),
  criteriaMode: 'all',
});
```

That resolver is useful for full form-library validation. For Vest's progressive runtime behavior, call focused runs from the relevant field interaction and render the Vest result:

```ts
async function validateUsername() {
  const values = form.getValues();
  const result = registrationSuite.only('username').run(values);
  render(result);
  await result;
  render(registrationSuite.get());
}
```

## Boundary option 1: Vest and Enforce

Use `enforce.shape` when Vest should own the complete path from untrusted input to progressive business validation:

```ts
const registrationSchema = enforce.shape({
  age: enforce.isNumeric().toNumber(),
  email: enforce.isString().trim(),
});

const registrationSuite = create(data => {
  test('age', 'Must be 18 or older', () => {
    enforce(data.age).greaterThanOrEquals(18);
  });
}, registrationSchema);

const result = await registrationSuite.runStatic(values);
if (result.isValid()) await api.register(result.value);
```

The schema parses and transforms the payload. The suite applies the authoritative business rules, and `result.value` contains the parsed output.

## Boundary option 2: Compose with another schema library

An application that already uses Zod or another schema library can keep it at the boundary:

```ts
const result = await registrationSuite.run(values);

if (result.isValid()) {
  const payload = registrationSchema.parse(values);
  await api.register(payload);
}
```

This is deliberate overlap: Zod parses this particular application's data contract while Vest manages the validation lifecycle and business rules. Enforce could replace Zod here when a single Vest-native schema and runtime are preferred.

See the complete [production architecture](./production-architecture.md), [Standard Schema reference](../community_resources/standard_schema.md), and [tool comparison](../vest_vs_the_rest.md).

If Vest itself should parse serialized inputs and infer the callback output, read [typed schemas and parsed results](./typed-schemas.md).
