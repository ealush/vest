# VestRuntime (`src/VestRuntime.ts`)

## Purpose

`VestRuntime.ts` is the orchestration layer for runtime-scoped state. It provides the context container used by every isolate execution and exposes lifecycle APIs used by higher layers (`vest`).

## Responsibilities

- Create and own runtime state references (`createRef`).
- Provide contextual execution (`Run`) through `context/createCascade`.
- Expose hooks for runtime data access (`useX`, `useXAppData`, `useHistoryRoot`, `useIsolate`, etc.).
- Maintain global-ish runtime registries that survive runs (`implicitOnlyNodes`, app data, bus).
- Manage runtime reset and pending/stability state.

## Key architecture choices

- **Persistent stateRef + ephemeral per-run context**:
  - `stateRef` persists between runs.
  - run-specific cursor fields (`historyNode`, `runtimeNode`, `runtimeRoot`) are recreated each execution.
- **`persist(cb)` contract**:
  async callbacks are rebound to the captured runtime context so delayed completions remain deterministic.
- **focus optimization registry**:
  `implicitOnlyNodes` sits on `stateRef` and is cleared at run start to avoid stale implicit-only decisions.

## Collaborators

- `src/IsolateWalker.ts`: tree queries and traversal helpers.
- `src/Isolate/*`: isolate state introspection/mutation.
- `src/Reconciler.ts`: execution reuse strategy.
- Consumed heavily by `packages/vest/src/core/Runtime.ts`.

## Nuances

- `Run` is the only safe entrypoint for code that expects runtime hooks.
- Reset semantics include runtime tree and focus-state cleanup; changing this can leak state across suite runs.
