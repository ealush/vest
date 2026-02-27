# Isolate (`src/Isolate/Isolate.ts`)

## Purpose

`Isolate.ts` is the runtime's node-construction and node-execution boundary. It is where a logical runtime unit (suite/test/group/focus wrapper) becomes a concrete tree node that can be reconciled, executed, and persisted.

## Responsibilities

- Construct new isolate instances (`IsolateInstance`) with normalized payload fields.
- Attach parent-child relationships for newly created nodes.
- Ask `Reconciler` whether to reuse history nodes or execute as new nodes.
- Execute callbacks in a nested runtime context via `VestRuntime.Run`.
- Track async lifecycle transitions (`INITIAL` -> `PENDING` -> `DONE`) and emit runtime events.

## Collaborators

- `src/Reconciler.ts`: decides reuse vs fresh execution.
- `src/VestRuntime.ts`: supplies contextual runtime state and persistence wrappers.
- `src/Isolate/IsolateMutator.ts`: mutation helpers for output/status/children.
- `src/Bus.ts`: event emission (`ISOLATE_ENTER`, `ISOLATE_RECONCILED`, `ISOLATE_PENDING`, `ASYNC_ISOLATE_DONE`).

## Execution model

1. `Isolate.create` builds a new candidate node.
2. Candidate is passed to `Reconciler.reconcile`.
3. If reconciled node is the same object as candidate, callback executes in a child runtime context (`useRunAsNew`).
4. If reconciled node is reused, callback is skipped and old output is kept.
5. Final output is saved, and when at root level, history root is replaced.

## Nuances and invariants

- **Identity check is intentional**: `Object.is(nextIsolateChild, newCreatedNode)` is the "run or reuse" gate.
- **Async completion uses `VestRuntime.persist`**: completion handlers keep the right runtime context even after promise resolution.
- **Root update only at top level**: prevents nested isolates from clobbering history root.
- **Type guard** (`Isolate.isIsolate`) is lightweight and key-based, used in async completion path.

## Why this file is architectural

This file is where execution strategy and tree reconciliation meet. Any change here affects correctness of reruns, async behavior, event ordering, and serialized runtime history.
