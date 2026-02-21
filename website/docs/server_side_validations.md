---
sidebar_position: 11
title: Server-Side & SSR
description: Learn how to use Vest with Node.js and Server-Side Rendering (SSR).
keywords:
  [
    Server side validation,
    Node.js,
    Validation state,
    Stateful vs stateless,
    runStatic,
    Resetting the suite,
    require,
    import,
    CommonJS,
    Package entry points,
    SSR,
    Hydration,
    SuiteSerializer,
    serialize,
    resume,
  ]
---

# Server-Side Validations

Vest is isomorphic and runs in Node.js environments.

## Stateless Runs

On the server, you typically want a stateless validation run - one that doesn't remember the previous state of fields.

In Vest, use the `.runStatic()` method. Each call produces a fresh result object without merging into prior state.

```javascript
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test('username', 'Required', () => {
    enforce(data.username).isNotBlank();
  });
});

export default suite;
```

**Usage in API Handler:**

```javascript
import suite from './validation';

app.post('/user', (req, res) => {
  // runStatic guarantees a fresh, stateless result every time
  const result = suite.runStatic(req.body);

  if ((result as any).then) {
    // If async tests exist, wait for completion
    return result.then(finalResult => {
      if (finalResult.hasErrors()) {
        return res.status(400).json(finalResult.getErrors());
      }
      // ...
      return res.sendStatus(204);
    });
  }

  if (result.hasErrors()) {
    return res.status(400).json(result.getErrors());
  }

  // ...
  // ...
});
```

## SSR & Hydration

When using Vest with Server-Side Rendering (SSR) frameworks (like Next.js, Remix, or Nuxt), you often want to validate on the server, send the validation state to the client, and resume without rerunning everything.

Use `SuiteSerializer.serialize` to serialize the suite state and `SuiteSerializer.resume` on the client to hydrate it.

### Server Side

```javascript
// server.js
import { SuiteSerializer } from 'vest';
import suite from './suite';

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Run validation
  const result = suite.runStatic(data);

  // Check for errors
  if (result.hasErrors()) {
    return json({
      errors: result.getErrors(),
      // Serialize the suite state to send to the client
      vestState: SuiteSerializer.serialize(suite),
    });
  }
}
```

### Client Side

On the client, hydrate the suite with the state received from the server using `SuiteSerializer.resume()`.

```javascript
// client.js
import { SuiteSerializer } from 'vest';
import suite from './suite';

export function MyForm({ actionData }) {
  // Resume the suite state if provided by the server
  if (actionData?.vestState) {
    SuiteSerializer.resume(suite, actionData.vestState);
  }

  // ... render form
}
```

Once resumed, `suite.hasErrors()`, `suite.isValid()`, and other selectors will return data reflecting the server-side run. Subsequent calls to `suite.run()` on the client will update this state normally.

For a deep dive into this pattern, read **[Server-Side Rendering & Hydration](./suite_serialization.md)**.
