# LLM Instructions for Vest

This document serves as the "Source of Truth" for Large Language Models (LLMs) generating code, refactoring, or debugging within the Vest repository. It outlines the unique architectural patterns, strict constraints, and idiomatic styles required to maintain system integrity.

## 1. Core Philosophy & Design Principles

- **Declarative Validation:** Vest is designed to look and feel like a unit testing framework (Mocha/Jest) but for form validation.
- **Isolate Architecture:** The core runtime mimics React's Fiber architecture. The system builds a tree of "Isolates" (stateful nodes) that are reconciled on every run.
- **Hook-based Internals:** Internal implementation relies heavily on "Hooks" (e.g., `useIsolate`, `usePending`) that access the current runtime context. **These functions only work inside a `VestRuntime.Run` context.**
- **Zero-Dependency Utils:** We do not use Lodash, Ramda, or other utility libraries. We maintain our own highly optimized, tree-shakeable utility library in `packages/vest-utils`.

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

This project uses a custom task runner called `vx`. **Do not use `npm` or raw scripts.**

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

### B. TypeScript & Types

- **Strict Mode**: All code must satisfy strict null checks.
- **Common Types**: Use these shared types from `vest-utils`:
  - `Maybe<T>` (T | undefined)
  - `Nullable<T>` (T | null)
  - `CB<T>` (Generic Callback function)
- **Generics**: Use generics heavily for Suites and Enforce extensions to maintain type safety for end-users.

### C. Internal Architectural Patterns

1.  **Isolates**: If you are adding a new stateful entity (like a new type of Test or Group), it must be an `Isolate`.
    - Refer to `packages/vestjs-runtime/src/Isolate/Isolate.ts`.
2.  **Runtime Hooks**: If you need to access the current suite state, use the `VestRuntime` hooks.
    - Example: `const ctx = VestRuntime.useIsolate();`
3.  **Event Bus**: Communication between the Runtime and the Suite happens via the Bus.
    - Refer to `packages/vest/src/core/VestBus/VestBus.ts`.

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
2.  [ ] **Verify Context**: Am I inside a `VestRuntime` context? Do I need `useIsolate`?
3.  [ ] **Type Safety**: Have I used `Maybe` or `Nullable` for optional values?
4.  [ ] **Immutability**: Am I mutating state directly? (Avoid this! Use the Reconciler or IsolateMutator).
5.  [ ] **Tests**: Have I added a unit test in `__tests__` that fails before my changes?
6.  [ ] **Dependencies**: Did I accidentally import `vest` into `vest-utils`? (Strictly forbidden).

## 7. Documentation

- Documentation lives in `website/docs`.
- If changing a public API, update the relevant Markdown file.
- Use `` tags in your response if you need to visualize the Isolate Tree or State flow, but only if requested by the user instructions.
