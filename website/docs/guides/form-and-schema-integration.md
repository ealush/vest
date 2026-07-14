---
title: Use Vest with Form and Schema Libraries
description: Let form managers own inputs, schemas protect submitted data, and Vest manage progressive validation state.
keywords: [React Hook Form Vest, Zod Vest, Standard Schema, form integration]
---

# Use Vest with Form and Schema Libraries

Vest does not need to replace the other validation-related tools in an application.

| Layer           | Owns                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| Form manager    | Values, registration, events, and submission mechanics                           |
| Vest            | Focused execution, retained results, dependencies, pending work, and async races |
| Boundary schema | Parsing and protecting the final submitted payload                               |

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

## Schema boundary

At submission, first await the full Vest workflow and then parse the payload with the application's boundary schema:

```ts
const result = await registrationSuite.run(values);

if (result.isValid()) {
  const payload = registrationSchema.parse(values);
  await api.register(payload);
}
```

This is deliberate overlap: both layers may express required fields, but they answer different questions. Vest manages the interaction lifecycle; the boundary schema guarantees the data contract.

See the complete [production architecture](./production-architecture.md), [Standard Schema reference](../community_resources/standard_schema.md), and [tool comparison](../vest_vs_the_rest.md).

If Vest itself should parse serialized inputs and infer the callback output, read [typed schemas and parsed results](./typed-schemas.md).
