# Focus & Scope Modifier Architecture

The `focus` API (`suite.focus({ ... })`) allows restricting validations to specific sub-graphs of the suite structure. Since a Vest suite executes linearly and declaratively, modifiers must inject themselves seamlessly into the suite resolution phase before any callback is evaluated.

To ensure optimal performance and correct precedence evaluation, focus modifiers are managed through Context variables, and their conditions are checked both at the structural boundary (Groups) and at the leaf nodes (Tests).

## 🏗️ Architecture

The Focus mechanism is divided into two operational layers:

1.  **Context Construction** (`vest/suite/useCreateSuiteRunner`): Configuration maps are transformed into high-performance `Set` abstractions before the test suite begins.
2.  **Structural Exclusion Analysis** (`vest/isolates/group` & `vest/hooks/focused/useIsExcluded`): Runtime hooks evaluate the current execution node against the Context modifiers to determine if the node should run, jump straight to skipped, or abort an entire block.

## 🏗️ Structure & Location

Focus modifiers strictly exist inside the **Suite Context** during a suite run: `SuiteContext.useX().modifiers`.

### State Preparation (`useTransformedModifiers`)

When `suite.focus()` is called, the passed modifiers (`SuiteModifiers`) configure the subsequent run. `onlyGroup` and `skipGroup` can be explicitly provided as strings or arrays of strings. Doing validating structural array iterations over strings during the suite run for every group and test definition would introduce a massive `O(N)` cost as the codebase scales.

To achieve `O(1)` amortized lookups throughout the execution tree, we wrap the original parameters inside `useTransformedModifiers`. This internal layer parses the user arguments and strictly initializes `Set<string>` structures for both group inclusion and exclusion lists prior to injecting them into the `SuiteContext` interface, represented as `TInternalModifiers`.

By explicitly defaulting missing arguments to empty `Set` objects rather than `undefined`, we eliminate any downstream `undefined` type-checking, enabling us to purely rely on zero-cost `isNotEmptySet()` boolean checks.

---

## 🔄 Update Lifecycle

Exclusion decisions must occur at the optimal branch of the isolate tree to prevent unnecessary workload processing.

### Flowchart

```text
       [ Isolate Encapsulation ]
                  |
     +------------v------------+
     |   Suite Context Sync    |  <-- Modifiers applied as Sets
     +------------|------------+
                  v
       [ Node Execution Begins ]
                  |
         Is it a Group Node?
          /                \
        Yes                 No (It's a Test)
        /                    \
[shouldSkipGroup]        [useIsExcluded By Field/Group]
      |                        |
(Destructive /              (Ascending Fallbacks)
 Constructive Checks)          |
      |                        v
   [SKIP?]                [Skip Node?]
```

### 1. Group Evaluation (`shouldSkipGroup` in `group.ts`)

When a `group()` callback is executed, Vest first invokes the `shouldSkipGroup(groupName)` logic before walking into the inner suite tests.

- **Destructive Block-list:** If `skipGroup` contains the group, the group immediately registers itself to inject a scoped `skip(true)` context. This completely suppresses internal testing.
- **Constructive Allow-list (`onlyGroup`):** If `onlyGroup` has active items (`isNotEmptySet(modifiers.onlyGroup)`), only matching groups are permitted. Any group missing from the allow-list is skipped.

If a group fails these checks, `skip(true)` pushes a transient `Focused` isolate into the tree for the duration of the group's callback. This prevents inner elements from executing, bypassing state registration overheads natively.

### 2. Top-Level Exclusion Handling (`useIsExcludedByGroup`)

A fundamental implication of using `onlyGroup` is the isolation of execution solely to targeted groups. Therefore, all "top-level" tests (tests declared without a parent group) must be reliably excluded.

Inside `useIsExcluded()` (specifically `useIsExcludedByGroup`), the test node is strictly verified against the `onlyGroup` rule. If `onlyGroup` is active, and the test lacks a `groupName`, it is instantly excluded. This rule handles edge cases dynamically—even if a top-level test shares the exact name of a successfully `only`'d test inside an allowed group, the top-level test will remain isolated and excluded.

### 3. Field Granularity (`useIsExcludedByField`)

If structural checks pass, the focus is evaluated down to the exact field declaration instance. Exclusions cascade hierarchically:

1.  **Individual Explicit Control:** `skipWhen()` boundaries.
2.  **Explicit Exclusion:** `skip` modifier targeting the field.
3.  **Explicit Inclusion:** `only` modifier targeting the field.
4.  **Implicit Exclusion:** If _any_ other field is `only`'d in the file and this field is not, it gets automatically suppressed.

## 🛠️ Precedence Mapping

To prevent conflicting instructions between `only`, `skip`, `onlyGroup`, and `skipGroup`, Vest strictly respects a **"Destructive Constraints override Constructive Constraints"** model:

1.  **Highest (`skipGroup`)**: Excluded groups skip everything inside them indiscriminately.
2.  **High (`onlyGroup`)**: If active, prunes both non-mentioned groups and top-level loose tests.
3.  **Medium (`skip`)**: Explicit field exclusions override even successfully retained groups.
4.  **Low (`only`)**: Narrows execution down to specific targets within any surviving groups.

This combination of `O(1)` Context transformation, transient isolate suppression, and strict precedence layering ensures that Vest remains highly responsive and precisely correct across vast suite depths.
