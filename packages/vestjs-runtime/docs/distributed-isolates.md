# Distributed Isolates & Auto-Hydration

**Distributed Isolates** allow the Vest Runtime to execute a validation branch on a remote server and "graft" the results back into the local client tree.

## The Auto-Hydration Flow

In standard Vest, an async isolate waits for a promise to resolve and then simply marks itself as `DONE`. Distributed Isolates change this mechanism by intercepting the result payload.

If the payload contains a specific signature (the **Safety Envelope**), the runtime deserializes it into a tree of nodes and attaches them to the current isolate.

### Visual Flow: The Interception Loop

```text
+-----------------------+
| Async Isolate (Web) |
+-----------------------+
 |
 v
 [ Await Promise ] <===============+
 | |
 v |
 [ Promise Resolves ] |
 | |
 v |
+-----------------------+ |
| Inspect Payload | |
+-----------------------+ |
 | |
 Is it a VestEnvelope? |
 | |
 NO ----+---- YES |
 | | |
 v v |
[Mark Done] [Deserialize] |
 [Graft Kids ] |
 | |
 v |
 [Mark Done] |
 |
+-----------------------+ |
| Server Response (API) |------------+
+-----------------------+

```

### Technical Implementation

We modified `useRunAsNewCallback` in `Isolate.ts`.

1. **Interception**: When the transport promise resolves, we run `Protocol.validate(result)`.
2. **Safety Check**:
* Does it have `__vest_sentinel__`?
* Does `version` match `VEST_RUNTIME_VERSION`?

3. **Grafting**: We call `IsolateMutator.addChild(current, deserializedNode)`.

This makes the network layer transparent to the reconciliation process. The runtime simply sees new children appear asynchronously.
