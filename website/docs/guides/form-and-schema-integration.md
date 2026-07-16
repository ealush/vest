---
title: Use Vest with Form and Schema Libraries
description: Use Vest with a form manager, an Enforce schema, or a schema library you already have.
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

The resolver covers full-form validation. To validate as the user types or leaves a field, run the relevant field through the same suite and render the Vest result:

```ts
async function validateUsername() {
  const values = form.getValues();
  const result = registrationSuite.only('username').run(values);
  render(result);
  await result;
  render(registrationSuite.get());
}
```

## Parse with Enforce

Use `enforce.shape` when you want Vest to parse the input as well as run the form's business rules:

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

The schema parses and transforms the payload. The suite runs the remaining rules, and `result.value` contains the parsed output.

## Keep another schema library

An application that already uses Zod or another schema library can keep it at the boundary:

```ts
const result = await registrationSuite.run(values);

if (result.isValid()) {
  const payload = registrationSchema.parse(values);
  await api.register(payload);
}
```

Here Zod parses the application's data contract and Vest handles validation during interaction. You can replace Zod with Enforce if you would rather keep both jobs in Vest.

See the complete [production architecture](./production-architecture.md), [Standard Schema reference](../community_resources/standard_schema.md), and [tool comparison](../vest_vs_the_rest.md).

If Vest itself should parse serialized inputs and infer the callback output, read [typed schemas and parsed results](./typed-schemas.md).
