---
title: Production Registration Architecture
description: A tested reference architecture combining progressive Vest validation with a final schema boundary and server validation.
keywords:
  [
    production form validation,
    Vest architecture,
    TypeScript registration example,
  ]
---

import ProductionRegistrationSandpack from '@site/src/components/Sandpack/ProductionRegistration';

# Production Registration Architecture

The canonical example keeps three responsibilities explicit:

> **The form layer owns the inputs, the schema owns the boundary, and Vest owns how validation evolves.**

The executable source lives in [`examples/production-registration`](https://github.com/ealush/vest/tree/latest/examples/production-registration).

## What it demonstrates

- React Hook Form owns values, registration, and submission mechanics.
- The official Standard Schema resolver connects full-form submission to Vest.
- Vest runs one field or one workflow step while retaining earlier results.
- Username availability is asynchronous and race-safe.
- Password confirmation is linked to password changes.
- Business accounts reveal a conditional company section.
- Password strength is a non-blocking warning.
- The server uses a stateless Vest run.
- Zod parses the final API boundary.
- A runnable Vite page demonstrates the architecture with deterministic local services.
- Vitest proves focused retention, async race behavior, conditionals, warnings, and server isolation.

## Try the browser workflow

This playground loads the browser files directly from the canonical example—there is no second copy to drift. Try `taken` as the username, correct it before the delayed response returns, switch to a business account, and submit a weak password to see errors, pending state, conditional validation, and warnings interact.

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

## Why both Vest and a boundary schema?

The schema protects a complete data boundary. It does not remember what happened during the previous interaction or decide which remote response is still relevant. Vest supplies that runtime behavior and then gets out of the way of parsing and persistence.

## Run the example

```shell
yarn workspace @vest/example-production-registration test
yarn workspace @vest/example-production-registration typecheck
yarn workspace @vest/example-production-registration build
yarn workspace @vest/example-production-registration dev
```

Start with the [suite source](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/registrationSuite.ts), then inspect the [React form](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/RegistrationForm.tsx) and [server handler](https://github.com/ealush/vest/blob/latest/examples/production-registration/src/server.ts).
