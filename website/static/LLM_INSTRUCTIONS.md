# LLM Instructions for Vest

This document serves as the "Source of Truth" for Large Language Models (LLMs) generating code, refactoring, or debugging within the Vest repository. It outlines the unique architectural patterns, strict constraints, and idiomatic styles required to maintain system integrity.

## 1. Core Philosophy & Design Principles

- **Declarative Validation:** Vest is designed to look and feel like a unit testing framework (Mocha/Jest) but for form validation.
- **Isolate Architecture:** The core runtime mimics React's Fiber architecture. The system builds a tree of "Isolates" (stateful nodes) that are reconciled on every run.
- **Hook-based Internals:** Internal implementation relies heavily on "Hooks" (e.g., `useIsolate`, `useEmit`) that access the current runtime context. **These functions only work inside a `VestRuntime.Run` context.** All internal functions that interact with runtime state should be prefixed with `use`.
- **Zero-Dependency Utils:** We do not use Lodash, Ramda, or other utility libraries. We maintain our own highly optimized, tree-shakeable utility library in `packages/vest-utils`.
- **Result Pattern:** Use `Result<T, E>` from `vest-utils` for operations that can fail. Prefer `makeResult.Ok(value)` and `makeResult.Err(error)` over throwing exceptions.

## 2. Repository Structure & Boundaries

Respect module boundaries to prevent circular dependencies.

| Package              | Description                                              | Dependencies Allowed                      |
| :------------------- | :------------------------------------------------------- | :---------------------------------------- |
| **`vest-utils`**     | Low-level shared utilities (Types, FP helpers).          | **NONE**. This is the foundational layer. |
| **`vestjs-runtime`** | The state management engine (Isolates, Bus, Reconciler). | `vest-utils`                              |
| **`n4s`**            | "Enforce" assertion library (Rules, Validation logic).   | `vest-utils`                              |
| **`vest`**           | The main validation library (Public API, Suites).        | `n4s`, `vestjs-runtime`, `vest-utils`     |
| **`vx`**             | Internal CLI and build tooling.                          | Node.js native only.                      |

## 3. Tooling & CLI (`vx`)

This project uses a custom task runner called `vx` for package operations. **Do not use `npm` or raw scripts for package building/testing.**

- **Setup**: `yarn` (Installs dependencies)
- **Build**: `yarn vx build` (Builds all packages)
- **Test (All)**: `yarn test run` (Runs Vitest in single-run mode)
- **Test (Package)**: `yarn vx test <pkg_name> run` (e.g., `yarn vx test vest-utils run`)
- **Typecheck**: `yarn vx typecheck` (Checks strict TypeScript compliance)
- **Lint**: `yarn lint` (Runs ESLint)

## 4. Coding Standards & Conventions

### A. The "Vest Utils" Mandate

**Never** implement a generic utility if it exists in `vest-utils`. **Always** import from `vest-utils` instead of native implementations when available for consistency and bundle size.

**Commonly Used Utilities:**

- **Null Checks**: `isNullish`, `isNotNullish` (Prefer over `== null`)
- **Flow**: `defaultTo`, `optionalFunctionValue`
- **Async**: `isPromise`
- **Types**: `isStringValue`, `isBoolean`, `isFunction`
- **Data**: `assign` (Immutable object assignment), `bus` (Event emitter)
- **Result Pattern**: `makeResult.Ok`, `makeResult.Err`, `Result<T>`, `unwrap()`, `isFailure()`
- **Security**: `isUnsafeKey` (Guards against prototype pollution)

### B. TypeScript & Types

- **Strict Mode**: All code must satisfy strict null checks.
- **Common Types**: Use these shared types from `vest-utils`:
  - `Maybe<T>` (T | undefined)
  - `Nullable<T>` (T | null)
  - `CB<T>` (Generic Callback function)
  - `Result<T, E>` (For fallible operations)
- **Generics**: Use generics heavily for Suites and Enforce extensions to maintain type safety for end-users.

### C. Internal Architectural Patterns

1.  **Isolates**: If you are adding a new stateful entity (like a new type of Test or Group), it must be an `Isolate`.
    - Refer to `packages/vestjs-runtime/src/Isolate/Isolate.ts`.
    - Isolate types are defined in `packages/vestjs-runtime/src/Isolate/IsolateTypes.ts`.

2.  **Transient Isolates**: Isolates that act as structural or control-flow nodes but do **not** hold state between runs.
    - Created via `IsolateTransient()` from `packages/vestjs-runtime/src/Isolate/IsolateTransient.ts`.
    - They **do not** persist in the history tree or get reconciled.
    - They **do not** appear in serialized suite dumps (`.dump()`).
    - They **do not** interfere with sibling indexing — the reconciler skips them when aligning child indices.
    - **Example**: `IsolateFocused` (used for `only()` and `skip()`).

3.  **Focus System (`IsolateFocused`)**: Manages `only()` and `skip()` execution boundaries via transient isolates.
    - Defined in `packages/vestjs-runtime/src/Isolate/IsolateFocused.ts`.
    - Uses a **two-tier approach** for exclusion checks:
      1.  **Explicit focus matching**: `Walker.findClosest` traverses up through ancestors and searches siblings at each level for a matching `IsolateFocused` node. Since `only()`/`skip()` create transient isolates that are **siblings** of the tests they affect, the search must start from the test object itself.
      2.  **Implicit ONLY identification**: When no explicit match is found, the runtime checks `hasImplicitOnly()` which walks the ancestor chain and queries `implicitOnlyNodes` (a `Set<TIsolate>` on `StateRef`). This is **O(Depth)**, not O(N).
    - The `implicitOnlyNodes` Set is populated in `useSetNextIsolateChild()` when an `IsolateFocused` with `FocusModes.ONLY` is added — its **parent** is registered in the Set.
    - At the vest layer, `useIsExcludedByField` combines both tiers and adds `include()` override logic.

4.  **Isolate Status**: Isolates have a status tracked via `IsolateStatus` enum:
    - `INITIAL` → `PENDING` → `DONE`
    - `INITIAL` → `HAS_PENDING` → `DONE` (for parent isolates with pending children)
    - Use `IsolateMutator.setPending()` and `IsolateMutator.setDone()` to change status.
    - Status automatically bubbles up to parent isolates.

5.  **Test Status**: Tests have their own status tracked via `TestStatus`:
    - `UNTESTED`, `STARTED`, `PASSING`, `FAILED`, `WARNING`, `CANCELED`, `SKIPPED`, `OMITTED`
    - **Note**: Use `STARTED` (not `PENDING`) for tests that are running.
    - Status is stored in `testStatus` property (not `status`).
    - Use `VestTest.setStatus()`, `VestTest.isStartedStatus()`, `VestTest.getStatus()`.

6.  **Registry System**: O(1) lookups for tests by characteristic:
    - `IsolateRegistry` (vestjs-runtime): Generic registry for isolate categorization.
    - `TestRegistry` (vest): Test-specific categories (`all`, `failed`, `passing`, `pending`, `warning`, `omitted`, `tested`, `valid`).
    - Use `useUpdateRegistry()`, `useGetFromRegistry()`, `useHasFromRegistry()`.

7.  **Runtime Hooks**: If you need to access the current suite state, use the `VestRuntime` hooks.
    - Example: `const root = VestRuntime.useAvailableRoot();`
    - Use `VestRuntime.useIsStable()` to check if all async operations are complete.
    - Use `VestRuntime.useIsFocusedOut(fieldName)` to check focus exclusion at the runtime level.

8.  **Event Bus (Two-Tier Architecture)**: Events are split between the runtime and vest layers.

    **Runtime-level events** (`packages/vestjs-runtime/src/RuntimeEvents.ts`):
    - `ISOLATE_ENTER`, `ISOLATE_PENDING`, `ISOLATE_DONE`, `ISOLATE_RECONCILED`, `ASYNC_ISOLATE_DONE`
    - Use `useEmit()` from `packages/vestjs-runtime/src/Bus.ts`.

    **Vest-level events** (`packages/vest/src/core/VestBus/BusEvents.ts`):
    - `TEST_COMPLETED`, `TEST_RUN_STARTED`, `SUITE_RUN_STARTED`, `SUITE_CALLBACK_RUN_FINISHED`, `ALL_RUNNING_TESTS_FINISHED`, `DEFER_THROW`, `REMOVE_FIELD`, `RESET_FIELD`, `RESET_SUITE`, `DONE_TEST_OMISSION_PASS`, `INITIALIZING_CALLBACKS`
    - Use `useEmit()` and `usePrepareEmitter()` from `packages/vest/src/core/VestBus/VestBus.ts`.

    **Important**: Always use the vest-level `useEmit` (from `VestBus.ts`) when working in the `vest` package. Do not call `Bus.useEmit()` from `vestjs-runtime` directly — the vest wrapper provides correct typing.

9.  **VestTest Class**: Standalone class for test operations (does not extend any base class).
    - Use `VestTest.is()` to check if an isolate is a test.
    - Use `VestTest.cast()` which returns `Result<TIsolateTest>` instead of throwing.
    - Use `VestTest.getData()` to access test data.

10. **Walker Module**: Tree traversal utility from `vestjs-runtime`.
    - `Walker.closest(node, predicate)` — Finds the closest ancestor matching a predicate.
    - `Walker.findClosest(node, predicate)` — Traverses up through ancestors, searching siblings at each level.
    - Use `Walker` for tree traversal. Use `TestRegistry` for O(1) lookups by category.

11. **Reorderable Isolates**: For dynamic test lists (e.g., `each()`), use `IsolateReorderable` which allows children to be matched by key rather than position during reconciliation.

### D. Naming Conventions

- **Hooks**: All functions that interact with runtime state must be prefixed with `use` (e.g., `useEmit`, `useReprocessTree`, `useOnTestStart`).
- **Reconcilers**: Register custom reconcilers via `registerReconciler()` from `vest` (`packages/vest/src/core/isolate/VestReconciler.ts`).

### E. Deleted/Deprecated Patterns

Do NOT use these patterns - they have been removed:

- ~~`VestIsolate` as a base class for test isolates~~ - Status is now managed directly on isolates via `IsolateMutator`. Note: the `VestIsolateType` type/const and `TVestIsolate` type helper still exist and are actively used for creating vest-level isolates.
- ~~`CommonStateMachine`~~ - Replaced by `IsolateStateMachine` in vestjs-runtime.
- ~~`SuiteWalker`~~ - Use `TestRegistry` for O(1) lookups or `Walker` for traversal.
- ~~`TestStatus.PENDING`~~ - Use `TestStatus.STARTED` for running tests.
- ~~`VestTest.isPending()`~~ - Use `VestTest.isStartedStatus()` or `VestTest.isStarted()`.
- ~~`suite.after()`~~ - Renamed to `suite.afterEach()`.
- ~~Calling `Bus.useEmit()` directly from vest code~~ - Use the typed `useEmit()` from `VestBus.ts` instead. `Bus.useEmit()` exists in vestjs-runtime but should only be used through the vest wrapper.

## 5. Testing Strategy (TDD)

- **Framework**: Vitest.
- **Location**: `__tests__` directory adjacent to the file being tested.
- **Naming**: `*.test.ts`.
- **Mocking**:
  - Use `vi.fn()` from Vitest.
  - For internal Vest mocking, check `packages/vest/src/testUtils/TVestMock.ts`.
- **Snapshots**: Use snapshots for:
  - Error messages.
  - Complex Isolate structures (to verify tree integrity).

## 6. Implementation Checklist for LLMs

When asked to implement a feature or refactor code:

1.  [ ] **Check `vest-utils` first**: Can I use an existing utility?
2.  [ ] **Verify Context**: Am I inside a `VestRuntime` context? Do I need runtime hooks?
3.  [ ] **Type Safety**: Have I used `Maybe` or `Nullable` for optional values? Am I using `Result<T>` for fallible operations?
4.  [ ] **Immutability**: Am I mutating state directly? (Avoid this! Use the Reconciler or IsolateMutator).
5.  [ ] **Hook Naming**: Does my function start with `use` if it interacts with runtime state?
6.  [ ] **Registry Updates**: If I'm changing test status, am I calling `useUpdateRegistry()`?
7.  [ ] **Transient vs Stateful**: Is my new isolate structural/control-flow only? If so, use `IsolateTransient`. If it holds business state, use `Isolate.create`.
8.  [ ] **Tests**: Have I added a unit test in `__tests__` that fails before my changes?
9.  [ ] **Dependencies**: Did I accidentally import `vest` into `vest-utils`? (Strictly forbidden).

## 7. Documentation

- Documentation lives in `website/docs`.
- If changing a public API, update the relevant Markdown file.
- Internal architecture documentation lives in `packages/vestjs-runtime/docs/`.
