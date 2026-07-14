---
title: Next.js Server Actions Without Double Validation
description: Run a shared Vest suite statelessly in a Server Action and resume its validation state in the browser.
keywords: [Next.js validation, Server Actions, SSR validation, Vest runStatic]
---

# Next.js Server Actions Without Double Validation

A Server Action must validate every request independently. When it returns errors, the browser should not need to rerun expensive rules merely to reconstruct the same validation state.

## Server Action

```ts
'use server';

import { SuiteSerializer } from 'vest/exports/SuiteSerializer';
import { registrationSuite } from './registrationSuite';

export async function register(data) {
  const result = await registrationSuite.runStatic(data);

  if (!result.isValid()) {
    return {
      ok: false,
      errors: result.getErrors(),
      vestState: SuiteSerializer.serialize(result),
    };
  }

  await saveAccount(data);
  return { ok: true };
}
```

`runStatic()` is important: a module-level suite may serve many concurrent requests, and server requests must not merge state with one another.

## Resume on the client

```tsx
'use client';

import { useEffect } from 'react';
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';
import { registrationSuite } from './registrationSuite';

export function RegistrationForm({ actionState }) {
  useEffect(() => {
    if (actionState?.vestState) {
      SuiteSerializer.resume(registrationSuite, actionState.vestState);
    }
  }, [actionState?.vestState]);

  // suite.get() now contains the server's complete validation result.
}
```

Resuming preserves more than an error map: the suite knows which rules passed, failed, or were skipped. The next browser interaction can therefore run one field while retaining trustworthy server conclusions.

## Add a parsing boundary

Parse untrusted action input with Zod, Valibot, Enforce, or another schema tool before persistence. Use Vest for business validation lifecycle and the schema for the submitted data contract.

The reference implementation is in the [production registration example](./production-architecture.md). See [suite serialization](../suite_serialization.md) for the lower-level API.
