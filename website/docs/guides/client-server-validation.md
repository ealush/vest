---
title: Client and Server Validation
description: Use one Vest suite for progressive browser interaction and independent server validation.
keywords: [server validation, client validation, SSR validation, runStatic]
---

# Client and Server Validation

The browser and server need different execution modes even when they share the same business rules.

- The browser uses stateful focused runs because interactions build on earlier results.
- The server uses `runStatic()` so concurrent requests never share validation state.

```ts
// browser
registrationSuite.only('email').run(formData);

// server
const result = await registrationSuite.runStatic(requestBody);
```

An API handler should await all async work before accepting data:

```ts
export async function register(request) {
  const data = await request.json();
  const result = await registrationSuite.runStatic(data);

  if (!result.isValid()) {
    return Response.json({ errors: result.getErrors() }, { status: 422 });
  }

  return createAccount(data);
}
```

## Continue server state in the browser

For server-rendered workflows, serialize the full result rather than sending only an error map:

```ts
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

const result = await registrationSuite.runStatic(data);
const vestState = SuiteSerializer.serialize(result);
```

Resume it on the client:

```ts
SuiteSerializer.resume(registrationSuite, vestState);
```

The suite now knows which tests passed, failed, or were skipped on the server and can continue with focused browser runs.

## Why serialize more than errors?

An error map does not describe successful tests, warnings, group status, skipped work, or omitted branches. Serialized Vest state retains that context, so the next browser interaction can continue from the authoritative server result instead of reconstructing an incomplete approximation.

An error map also creates a second UI integration path. The application must store the server errors, route each message to the correct field component, decide how those messages interact with client errors and warnings, and clear or merge them when the user edits again.

Resuming Vest state avoids that parallel wiring. If the form already renders from the suite, the same selectors immediately expose the server result after `SuiteSerializer.resume()`:

```ts
registrationSuite.getMessage('email');
registrationSuite.getErrors('email');
registrationSuite.getWarnings('password');
```

The UI does not need a special `serverErrors` branch. Its existing bindings keep reading from the same suite before hydration, after the server state arrives, and after subsequent focused client runs. Vest is not connecting to the components automatically; resumption makes the server result available through the validation source those components already use.

Resume only when new server state arrives. Do not resume the same payload on every render.

Use a separate boundary schema when you also need structural parsing or transformation. See the [production architecture](./production-architecture.md) and [SSR serialization reference](../suite_serialization.md).
