# Reconciler (`src/Reconciler.ts`)

## Purpose

`Reconciler.ts` determines whether a newly requested isolate can reuse a previous history node or must execute as a fresh node.

## Architectural role

It is the performance and determinism pivot of the runtime:

- Reuse keeps previous output and avoids re-running stable branches.
- Fresh execution ensures correctness when node identity/profile/order has changed.

## Collaboration graph

- Called by `Isolate.create` before callback execution.
- Consumes runtime cursor/state from `VestRuntime`.
- Works with isolate inspectors/mutators to navigate and update sibling position/cursors.

## Invariants

- Reconciliation decisions must be local to the current parent/cursor position.
- Transient/focus isolates must not break indexing of non-transient siblings.
- Reused nodes must preserve compatibility with expected isolate profile.

## Why this file is architectural

The reconciler governs incremental execution. Errors here cause subtle stale output reuse, skipped execution, or unnecessary recomputation across entire suites.
