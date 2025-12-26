---
sidebar_position: 4
title: Distributed Validations
---

# Distributed Validations

:::info Feature Name
Formerly known as "Server-Side Validations". We renamed it to **Distributed Validations** to reflect the mental model: extending your validation tree across the network.
:::

Vest allows you to run parts of your validation suite on the server (like checking if a username is taken) and seamlessly "graft" the results back into your client-side form.

## The Mental Model

Don't think of it as "calling an API." Think of it as **Distributed Execution**.

You define a validation suite. Parts of it run in the browser (sync), and parts of it run on the server (remote). Vest stitches them together so they look like one unified result object.

### How Grafting Works

```text
Your Suite Tree (Client)        Remote Branch (Server)
+----------------------+        +--------------------+
|  Root                |        |  ServerRoot        |
|  |                   |        |  |                 |
|  +-- Test: Required  |        |  +-- Test: Unique  |
|  |   (Pass)          |        |      (Fail)        |
|  |                   |        +--------------------+
|  +-- Server Isolate  |                   |
|      (Pending...)    | <-------[ JSON ]--+
+----------------------+
          |
          v
   ( After Grafting )
+----------------------+
|  Root                |
|  |                   |
|  +-- Test: Required  |
|  +-- Server Isolate  |
|      |               |
|      +-- Test: Unique| <--- The error is now here!
+----------------------+
```

## Quick Start

### 1. Define a Contract (Shared)

Create a file shared by Client and Server. This "Token" identifies the validation logic.

```typescript
// shared/contracts.ts
import { createSession } from 'vest';
export const UserUniqueCheck = createSession('USER_UNIQUE_CHECK');
```

### 2. Implement on Server

On your backend, register the logic. This code **never** loads in the browser.

```typescript
// server/validations.ts
import { server, test } from 'vest';
import { UserUniqueCheck } from '../shared/contracts';

server(UserUniqueCheck, data => {
  test('username', 'Username taken', async () => {
    return await db.users.isUnique(data.username);
  });
});
```

### 3. Configure Transport (Client)

Tell Vest how to talk to your API (fetch, axios, etc). Do this once in your app setup.

```typescript
// client/setup.ts
import { createServerAdapter } from 'vest';

createServerAdapter(async (tokenId, data, { signal }) => {
  const response = await fetch('/api/validate', {
    method: 'POST',
    body: JSON.stringify({ tokenId, data }),
    signal // Connects the AbortSignal for cancellation
  });
  });
  return await response.json();
});

```

### 4. Use in Suite (Client)

Pass the **Token** and **Data** to `server()`. Vest handles the rest.

```typescript
// client/suite.ts
import { create, server } from 'vest';
import { UserUniqueCheck } from '../shared/contracts';

create('Signup', data => {
  // 1. Standard checks
  test('username', 'Required', () => !!data.username);

  // 2. Distributed check
  // Vest pauses, sends 'data' to server, and merges the result here.
  server(UserUniqueCheck, data);
});
```

## Safety & Security

Distributed Validations include a built-in **Safety Envelope**.

1. **Versioning:** If your client and server versions drift, Vest detects the mismatch and ignores the server response to prevent "Zombie State" (loading incompatible validation trees).
2. **Sentinels:** The protocol ensures you don't accidentally hydrate random API JSON responses into your validation state.
3. **Auto-Abort:** If a user types quickly, Vest automatically aborts stale network requests, ensuring the UI always reflects the latest state.
