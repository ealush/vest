# Vest runtime bridge (`src/core/Runtime.ts`)

## Purpose

`packages/vest/src/core/Runtime.ts` is the package-level adapter between generic `vestjs-runtime` state machinery and Vest-specific state (callbacks, suite cache, suite id).

## Responsibilities

- Build suite state refs via `useCreateVestState`.
- Expose accessors for done callbacks and field callbacks.
- Maintain suite result cache lifecycle (read/invalidate).
- Provide suite reset/load operations that coordinate runtime history and Vest callback caches.

## Integration points

- Uses `VestRuntime.createRef` for shared runtime features.
- Adds Vest-owned `appData` (`doneCallbacks`, `fieldCallbacks`, `suiteResultCache`, `suiteId`).
- Invokes isolate-tree reprocessing on load (`useReprocessTree`) to restore executable state after deserialization/loading.

## Nuances

- Cache invalidation is coupled to suite id; wrong invalidation can return stale suite results.
- `useResetSuite` must reset both Vest-local callback state and runtime history state.
