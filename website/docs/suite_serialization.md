---
sidebar_position: 10
title: Server-Side Rendering (SSR)
description: How to serialize Vest state on the server and resume it on the client using SuiteSerializer.
keywords: [Vest, SSR, Next.js, Remix, Hydration, Serialization, SuiteSerializer]
---

# Server-Side Rendering (SSR) & Hydration

Modern frameworks like Next.js, Remix, and SvelteKit often validate forms on the server before sending a response. A common problem is "Double Validation": running tests on the server, showing errors, but then forcing the client-side library to re-run everything from scratch to "know" about those errors.

Vest 6 solves this with **State Serialization**. You can take the state of a suite calculated on the server and "inject" it into the client-side suite.

## The `SuiteSerializer`

To keep the API surface clean, serialization tools are grouped under the `SuiteSerializer` export.

```javascript
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';
```

### `SuiteSerializer.serialize(result)`

Takes a result object (for example, from `suite.runStatic(data)`) and returns a serializable string (safe for JSON transport).

### `SuiteSerializer.resume(suite, serializedData)`

Takes a suite instance and serialized data, and applies that state to the suite.

## Complete Workflow Example

Imagine a Remix or Next.js action handling a form submission.

### 1. Server Side

Run the validation. If it fails, send the serialized state back to the frontend.

```javascript
// server-action.js
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';
import suite from './validation';

export async function action(formData) {
  // 1. Run validation
  // We use runStatic and serialize that result for hydration
  const result = suite.runStatic(formData);

  if (result.hasErrors()) {
    return {
      success: false,
      errors: result.getErrors(),
      // 2. Serialize the server result state
      vestState: SuiteSerializer.serialize(result),
    };
  }

  // ... handle success
}
```

### 2. Client Side

When your component mounts or receives the action data, resume the suite.

```javascript
// registration-form.jsx
import { useEffect } from 'react';
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';
import suite from './validation';

export function RegistrationForm({ actionData }) {
  // 3. Resume state if it exists
  if (actionData?.vestState) {
    SuiteSerializer.resume(suite, actionData.vestState);
  }

  // suite.get() now immediately reflects the server errors!
  // suite.hasErrors('username') will be true without running logic.

  return <form>{/* ... inputs ... */}</form>;
}
```

:::caution Why not just pass the errors?
You might wonder, "Why not just pass the error object?"
If you only pass errors, your suite doesn't know _which_ tests passed, which are pending, or which groups were skipped. Resuming the full state lets the next field edit continue from the server result without rebuilding that context in the client.
:::
