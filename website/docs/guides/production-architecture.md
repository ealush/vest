---
title: Complete Registration Example
description: A tested registration form with focused validation, async checks, schema parsing, and server validation.
keywords:
  [
    production form validation,
    Vest architecture,
    TypeScript registration example,
  ]
---

import ProductionRegistrationSandpack from '@site/src/components/Sandpack/ProductionRegistration';

# Complete Registration Example

This example splits the work between three pieces:

> **The form layer owns the inputs, the schema owns the boundary, and Vest owns how validation evolves.**

The executable source lives in [`examples/production-registration`](https://github.com/ealush/vest/tree/latest/examples/production-registration).

## What is in the example

- React Hook Form owns values, registration, and submission mechanics.
- The official Standard Schema resolver connects full-form submission to Vest.
- Vest runs one field or one workflow step while retaining earlier results.
- Username availability is asynchronous and race-safe.
- Password confirmation is linked to password changes.
- Business accounts reveal a conditional company section.
- Password strength is a non-blocking warning.
- The server uses a stateless Vest run.
- This implementation uses Zod for the final API boundary; an Enforce schema can own the same boundary through `.parse()` or as the suite schema.
- A runnable Vite page demonstrates the architecture with deterministic local services.
- Vitest proves focused retention, async race behavior, conditionals, warnings, and server isolation.

## Try it

The playground loads its files from the example project, so the code shown here and the tested example stay in sync. Try `taken` as the username and change it before the delayed response returns. You can also switch to a business account or submit a weak password to see the conditional fields and warning state.

<ProductionRegistrationSandpack />

The server handler and Server Action remain in the standalone project because a browser sandbox cannot faithfully demonstrate request isolation, HTTP failures, or secret handling. Those paths stay covered by the example's Vitest suite.

## Request flow

```text
Field interaction
  → suite.only(field).run(values)
  → render tested / pending / error / warning state

Step navigation
  → suite.focus({ onlyGroup: step }).run(values)
  → await async work
  → continue only when the group is valid

Submission
  → React Hook Form awaits Vest through the Standard Schema resolver
  → boundarySchema.parse(values)
  → POST parsed values
  → server boundarySchema.parse(requestBody)
  → server suite.runStatic(parsedValues)
  → persist parsed payload
```

## Why the example also uses Zod

Many applications already use Zod, so this example shows how to keep it. Zod parses the submitted payload; Vest handles focused runs, async checks, warnings, conditional fields, and server-side business rules.

Zod is optional here. An Enforce schema created with `enforce.shape` can parse and transform the payload with `.parse()`. You can also pass it to `create`; then `run()` and `runStatic()` expose the parsed value as `result.value`.

## Run the example

```shell
yarn workspace @vest/example-production-registration test
yarn workspace @vest/example-production-registration typecheck
yarn workspace @vest/example-production-registration build
yarn workspace @vest/example-production-registration dev
```

Start with the [suite source](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/registrationSuite.ts), then inspect the [React form](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/RegistrationForm.tsx) and [server handler](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/server.ts).
