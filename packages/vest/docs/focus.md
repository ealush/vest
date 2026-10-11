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

## 🧾 Schema Execution Under Focus

A suite schema runs once per run, before the suite callback. With `only` or `skip` set on an Enforce (n4s) schema, the run must satisfy two contracts that pull in different directions:

- **Reporting is focused.** Schema failures are emitted only for focused fields. Unfocused fields keep their previous schema verdict (see `retainedSchemaFailures.ts`), just as unfocused user tests keep theirs.
- **Output is typed as complete.** The suite callback input and `result.value` are typed as the complete parsed output (`InferSchemaOutput<S>`), not as the focused subset.

**Why a passing focused run needs a full parse.** A field's parsed form, such as `'42'` becoming `42` or a trimmed string, exists only after its schema rule has run on it, because parsers are part of the rule chain. A focused parse runs only the focused fields' rules. Every unfocused field therefore needs its rule run before the output can have its complete parsed type, and running every field's rule is a full parse. The alternatives do not hold:

- Reusing an earlier parsed value without checking the input is stale when the input has changed since, and a field that was never parsed has no earlier value.
- Parsing lazily when `result.value` is read is too late, because the suite callback receives the data before its tests run.
- Parsing unfocused fields one by one runs the same rules at the same cost.

Two optimizations can narrow this work later without changing the contract:

- Reuse the parsed output of an unfocused field whose input is unchanged since it was last parsed, and parse only the fields whose input changed. Comparing by identity misses in-place mutation, and a parser that reads sibling fields through `enforce.context()` would come out stale. See [#1362](https://github.com/ealush/vest/issues/1362).
- Skip fields whose rules do not transform, because their output equals their input. This needs n4s to expose which schemas contain parsers.

`runFocusedSchema` in `useCreateSuiteRunner.ts` resolves this in two steps:

1. **Complete parse first.** The whole input is parsed against the whole schema. If it passes, nothing needs reporting, and its output has the complete parsed shape. The callback and `result.value` receive it.
2. **Focused parse as fallback.** If the complete parse fails, its failures cannot be reported. n4s fails fast, so a failure outside the focus may hide a focused field's failure, and reporting it would break focus. The focused schema (`pick`/`omit` of the shape) runs instead and reports the focused fields. The output is then **best effort**: focused fields parsed and the others as they were passed in.

`valid` is unchanged by this: it combines the focused verdicts with the retained ones. A focused run can therefore be `valid` while an unfocused field's current input would fail. In that case the output keeps that field unparsed. A result is only as fresh as the focus the application requests. Vest does not sanitize fields that a focused run leaves out, so run the whole suite before relying on `result.value`, for example on submission.

When the schema rejects the input, the suite callback receives the input as it was passed in, so its tests can still run and report messages. The callback's parameter type still describes the parsed output; inside tests, values of fields that failed parsing are best effort as well.

**Cost.** A passing focused run parses the whole input once, the same schema work as a full run, so focus no longer narrows schema execution. Focus still narrows user tests. A focused run where the complete parse fails parses twice: once completely, until the first failure, and once for the focused fields. Schemas without focus, and schemas other than Enforce schemas, are parsed once as before.

## 🛠️ Precedence Mapping

To prevent conflicting instructions between `only`, `skip`, `onlyGroup`, and `skipGroup`, Vest strictly respects a **"Destructive Constraints override Constructive Constraints"** model:

1.  **Highest (`skipGroup`)**: Excluded groups skip everything inside them indiscriminately.
2.  **High (`onlyGroup`)**: If active, prunes both non-mentioned groups and top-level loose tests.
3.  **Medium (`skip`)**: Explicit field exclusions override even successfully retained groups.
4.  **Low (`only`)**: Narrows execution down to specific targets within any surviving groups.

This combination of `O(1)` Context transformation, transient isolate suppression, and strict precedence layering ensures that Vest remains highly responsive and precisely correct across vast suite depths.
