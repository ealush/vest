# Vest Server Architecture

The `vest/server` module implements an **Isomorphic Execution Boundary**. It provides a single API (`server()`) that behaves differently depending on where it runs.

## Architecture Overview

This diagram illustrates how the `server()` function acts as a bridge between the Client Runtime and the Server Runtime.

```text
CLIENT SIDE (Browser)                  SERVER SIDE (Node/Edge)
+-------------------------------+      +--------------------------------+
|                               |      |                                |
|  vest.create('Signup', () => {|      |  // Registry Lookup            |
|    test('name', ...);         |      |  const cb = Registry.get(ID);  |
|                               |      |                                |
|    // 1. Pause & Send         |      |  // 2. Headless Run            |
|    server(UserCheck, data);---|----->|  vest.create(ID, cb)();        |
|  });                          |      |                                |
|                               |      |  // 3. Serialize Tree          |
|  // 4. Hydrate & Graft        |<-----|--return serialized;            |
|  (Result appears in suite)    |      |                                |
+-------------------------------+      +--------------------------------+

```

## Core Components

### 1. The Session Token (`createSession`)

A lightweight object `{ id: string }`. It acts as the "Contract" between client and server, preventing the need to import actual server code into the client bundle.

### 2. The Server Registry

A singleton `Map` on the server.

* **Registration**: When you call `server(Token, callback)` on the server, it stores the callback.
* **Execution**: The API handler looks up the callback by ID and runs it.

### 3. The IsolateServer

The entry point `server()` switches modes based on its arguments:

* **Function passed?** → Registration Mode (Server).
* **Data passed?** → Execution Mode (Client).

### 4. Concurrency Management

To handle race conditions (e.g., a user typing fast), `IsolateServer` implements **Switch Map** logic:

1. Stores `AbortController` in a map keyed by Session ID.
2. On a new call, it aborts the previous pending request.
3. Passes the `signal` to the `ServerAdapter`.
