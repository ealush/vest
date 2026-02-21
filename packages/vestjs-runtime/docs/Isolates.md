# Isolates Architecture

## What is an Isolate?

In the `@vestjs-runtime`, an "Isolate" is the fundamental building block of the state and execution tree. Every piece of business logic or structural grouping—whether it's a test, a suite, a group, or a focus context—is represented as an Isolate.

The term "isolate" stems from its purpose: creating an isolated context where functionality runs safely. When traversing the tree of isolates, each context is maintained correctly, preventing sibling states from polluting one another.

Every Isolate contains at minimum:

- `Type`: A string defining the nature of the Isolate (e.g. `'Test'`, `'Suite'`, `'Group'`).
- `Parent` / `Children`: Linking to construct the overall state tree structure.
- `Data`: Any metadata the Isolate requires to execute properly.
- `Status`: Current state of resolution (e.g. `PENDING`, `DONE`).

---

## Types of Isolates

Isolates behave differently depending on their internal configurations and traits:

### 1. Stateful Isolates (Default)

Most isolates created with `Isolate.create()` are stateful. This means:

- They persist in the internal history tree.
- They are subject to reconciliation (comparing current vs previous states between executions).
- They have a predefined order in the tree matching their execution sequence, which prevents unpredictable side-effects between runs.
- **Example:** A `VestTest` or a `Group`. The runtime tracks how many tests successfully ran before.

### 2. Transient Isolates

Transient isolates act as "structural" or "control flow" isolates but don't hold state between runs.

Characteristics of transient isolates:

1. They **do not** persist in the history tree.
2. They **are not** reconciled with previous runs.
3. They **do not** appear in the serialized suite dump (no `.dump()` presence).
4. They **do not interfere** with the indexing of siblings. Since they are transient, the runtime reconciler effectively skips them when aligning sibling child indices.

These are primarily used as invisible "modifiers" that dictate logic over their children but hold no inherent measurable business-state of their own.

- **Example:** `IsolateFocused` (used for `.only` and `.skip`).

---

## Focus Capabilities (`IsolateFocused`)

`IsolateFocused` is a specialized implementation of a Transient Isolate used to manage the `only` and `skip` execution boundaries.

Because they are transient, testing an `only()` block will not incorrectly disrupt the index sequence of test components evaluated below it. It is strictly used as an execution-context layer.

### How Focus Checking Works

Focus checking uses a **two-tier approach**: explicit matching and implicit exclusion.

#### 1. Explicit Focus Matching (`findClosest` — sibling-aware)

`Walker.findClosest` traverses UP through ancestor levels, and at each level searches the **children** (siblings) for a matching `IsolateFocused` node. Because `only()` and `skip()` create transient isolates that are **siblings** of the tests they affect (not ancestors), the search must start from the test object itself to correctly find focus rules at the same tree level.

**Important:** Starting from `useIsolate()` (the parent context) would be one level too high and would miss sibling focus isolates entirely. This is why the vest-level `useIsExcludedByField` passes the specific `testObject` to `findClosest`, while the runtime-level `useIsFocusedOut` starts from the current isolate context.

If an explicit focus match is found:

- **Skip-focused:** The test is excluded immediately.
- **Only-focused:** The test is NOT excluded (it matched the only rule).

#### 2. Implicit ONLY Identification (`hasImplicitOnly` — centralized registry)

When no explicit focus match is found for a test, the runtime checks whether any ancestor scope contains an `ONLY` rule — meaning any test _not_ explicitly matched should be excluded.

To keep this check **O(Depth)** performant — instead of O(N) traversing thousands of elements per check — the runtime maintains a centralized `implicitOnlyNodes` Set on the `StateRef` context. When an `IsolateFocused` node with `FocusModes.ONLY` is created, its **parent** is registered in this Set via `useSetNextIsolateChild`.

When checking implicit exclusion, `hasImplicitOnly()` simply walks up the current node's ancestors and queries `implicitOnlyNodes.has(current)` at each level. This approach:

- **Separates concerns:** The Isolate data model remains pure — no focus-specific flags on AST nodes.
- **Is O(Depth):** Only walks the ancestor chain, not the full tree.
- **Is centralized:** All implicit-only state lives on the runtime's `StateRef`, not scattered across nodes.

### Interaction with `include()`

At the vest application layer, `useIsExcludedByField` combines both tiers:

1. Explicit focus match via `useClosestMatchingFocus(testObject, fieldName)`.
2. If no match, falls back to `VestRuntime.hasImplicitOnly()`.
3. If implicitly excluded, checks the `inclusion` map — `include()` rules can override implicit exclusion but **not** explicit `skip()`.

---

## The Reconciler Core

All isolates (except Transient ones) pass through the underlying Reconciler matching system. The reconciler evaluates:

1. Is there an active existing node from the previous history tree in this slot?
2. If yes: Can it be reused? (Bypassing execution to save processing).
3. If no: The execution runs anew and is marked as new runtime history.
