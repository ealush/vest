# Isolate Registry Architecture & API

The Isolate Registry is a high-performance, O(1) indexing system that tracks isolates based on configurable predicates and keys. It eliminates the need for expensive tree traversals when calculating suite results or checking test statuses.

## 🏗️ Architecture

The Registry is divided into two layers:

1.  **Generic Engine (`vestjs-runtime/IsolateRegistry`)**: A predicated indexing engine with **configurable key selectors**. It manages maps of sets on the root isolate and is completely agnostic to both the predicates and key extraction logic.
2.  **Vest Configuration (`vest/TestRegistry`)**: Defines the categories (failed, pending, etc.) and provides **both predicates and key selectors** (e.g., extracting `fieldName` from test data).

### Key Configuration (`RegistryCategoryConfig`)

Each category is defined by:

```typescript
type RegistryCategoryConfig = {
  predicate: (isolate: TIsolate) => boolean; // What isolates match this category?
  getKey: (isolate: TIsolate) => string; // How to group them (e.g., by fieldName)?
};
```

This decoupling allows `vestjs-runtime` to remain **domain-agnostic** while Vest defines how to extract keys from its test data.

## 🏗️ Structure & Location

The registry is stateful and is stored directly on the **Root Isolate** of a suite.

### Storage Location

Each category is stored in the `root.data` object with a `registry_` prefix:

- `root.data.registry_failed`
- `root.data.registry_pending`
- ...and so on.

### Shape

Each registry entry is a `RegistryIndex`:

```typescript
type RegistryIndex = Map<string, Set<TIsolate>>;
```

- **Key**: Determined by the `getKey` function in the category config (e.g., `fieldName` for tests, or `_generic` for null keys).
- **Value**: A `Set` containing all isolates currently matching that category.

---

## 🔄 Update Lifecycle

The registry is **reactive**. It re-evaluates its state whenever relevant events occur.

### Flowchart

```text
       [ Isolate Event ]
              |
      ( Enter / Status Change )
              |
              v
      useUpdateRegistry
              |
    +---------v-------------------+
    | Iterates all Predicates     |
    +---------|-------------------+
              |
    +---------v-------------------+
    | For each Category:          |
    | [Match?] --Yes--> [Add]     |
    |    |-------No---> [Remove]  |
    +---------|-------------------+
              |
              v
    Root.data["registry_<category>"]
```

### When do updates happen?

1.  **Initial Registration (`ISOLATED_ENTER`)**: When a node is first encountered.
2.  **Status Changes (`setStatus`)**: When a test moves between states (e.g. Pending -> Failed).
3.  **Cross-Suite Reconciliation**: When a tree is reprocessed or merged.
4.  **Field Removal**: When `REMOVE_FIELD` is emitted, the registry cleans up all indexed categories for a specific field.

---

## 🛠️ APIs

### `IsolateCategory` (Vest specific)

- `failed`: Tests with error severity.
- `omitted`: Tests that were not run.
- `passing`: Tests that passed.
- `pending`: Tests currently in progress.
- `tested`: Tests that have finished running.
- `valid`: Tests that are either passing or warnings.
- `warning`: Tests with warning severity.

### Core Engine (`vestjs-runtime/IsolateRegistry`)

#### `useUpdateRegistry(isolate, predicates)`

```typescript
useUpdateRegistry(
  isolate: TIsolate,
  predicates: Record<string, RegistryCategoryConfig>
): void
```

Evaluates all predicates and updates the registry. For each category:

- Calls `config.predicate(isolate)` to check if it matches
- Calls `config.getKey(isolate)` to determine the index key
- Adds to or removes from the appropriate registry index

#### `useGetFromRegistry(category, key?)`

```typescript
useGetFromRegistry(category: string, key?: string): Set<TIsolate>
```

Retrieves isolates for a category. If `key` is provided (e.g., a fieldName), returns only isolates indexed under that key. Otherwise, returns all isolates in the category.

#### `useHasFromRegistry(category, key?)`

```typescript
useHasFromRegistry(category: string, key?: string): boolean
```

Returns `true` if any isolates exist for the given criteria.

#### `useRemoveFieldFromRegistry(key)`

```typescript
useRemoveFieldFromRegistry(key: string): void
```

Removes all entries for a specific key (e.g., fieldName) from all registry categories.

#### `useClearRegistry(root)`

```typescript
useClearRegistry(root: TIsolate): void
```

Clears all registry indices from the root isolate. Used during tree reprocessing.
