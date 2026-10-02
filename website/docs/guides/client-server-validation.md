---
title: Client and Server Validation
description: Use one Vest suite for field-by-field browser validation and independent server requests.
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
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

export async function register(request) {
  const data = await request.json();
  const result = await registrationSuite.runStatic(data);

  if (!result.isValid()) {
    return Response.json(
      {
        errors: result.getErrors(),
        vestState: SuiteSerializer.serialize(result),
      },
      { status: 422 },
    );
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

An error map leaves out successful tests, warnings, group status, skipped work, and omitted branches. Serialized Vest state keeps all of that, so the browser can continue from the server result instead of rebuilding part of it by hand.

An error map also creates a second UI integration path. The application must store the server errors, route each message to the correct field component, decide how those messages interact with client errors and warnings, and clear or merge them when the user edits again.

Resuming Vest state avoids a second set of wiring. If the form already renders from the suite, the same selectors expose the server result after `SuiteSerializer.resume()`:

```ts
registrationSuite.getMessage('email');
registrationSuite.getErrors('email');
registrationSuite.getWarnings('password');
```

The UI does not need a special `serverErrors` branch. Its existing bindings keep reading from the same suite before hydration, after the server state arrives, and after subsequent focused client runs. Vest is not connecting to the components automatically; resumption makes the server result available through the validation source those components already use.

Resume only when new server state arrives. Do not resume the same payload on every render.

Add a schema when you also need to parse or transform the submitted data. See the [complete registration example](./production-architecture.md) and [SSR serialization reference](../suite_serialization.md).
