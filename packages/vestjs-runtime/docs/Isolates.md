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

### How Focus Checking Works (`useIsFocusedOut`):

The method `useIsFocusedOut` is utilized during the execution of any node traversing the tree. It is inherently evaluated against its parents (bottom-up approach).

1. **Explicit Targeting (`findClosest`)**: The runtime travels upward traversing parent paths specifically looking for an `IsolateFocused` element. If found, it establishes whether the targeted node matches the parent's `match` rule.
2. **Implicit ONLY Identification (`hasImplicitOnly`)**: An `ONLY` isolate natively restricts any untested sibling in the entire scoped branch! To keep the runtime $O(Depth)$ performant—instead of $O(N)$ traversing thousands of elements per check—the runtime directly registers its parent node to a master `implicitOnlyNodes` Set attached to the `StateRef` context when instantiated. When an unrecognized node verifies its focus state, it gracefully crawls upward and queries the `implicitOnlyNodes` registry to see if any of its structural ancestors are within it.

This approach separates structural properties fully from AST-state variables and minimizes tree-walking lookup latency drastically.

---

## The Reconciler Core

All isolates (except Transient ones) pass through the underlying Reconciler matching system. The reconciler evaluates:

1. Is there an active existing node from the previous history tree in this slot?
2. If yes: Can it be reused? (Bypassing execution to save processing).
3. If no: The execution runs anew and is marked as new runtime history.
