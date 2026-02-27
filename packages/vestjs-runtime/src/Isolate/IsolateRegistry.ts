/**
 * Module: `src/Isolate/IsolateRegistry.ts`.
 *
 * Provides `IsolateRegistry`-related runtime and type utilities used by `vestjs-runtime`.
 */
import { Nullable, isEmptySet, isNotEmptySet } from 'vest-utils';

import { useAvailableRoot } from '../VestRuntime';
import { TIsolate } from './Isolate';

/**
 * A registry index, mapping group keys (like field names) to sets of isolates.
 */
export type RegistryIndex = Map<string, Set<TIsolate>>;

/**
 * Configuration for a registry category.
 */
export type RegistryCategoryConfig = {
  predicate: (isolate: TIsolate) => boolean;
  getKey: (isolate: TIsolate) => string;
};

/**
 * Updates the registration of an isolate in all relevant indices based on provided predicates.
 *
 * @param isolate - The isolate node to update.
 * @param predicates - A record of category keys and their corresponding predicate configurations.
 */
export function useUpdateRegistry(
  isolate: TIsolate,
  predicates: Record<string, RegistryCategoryConfig>,
) {
  const root = useGetAvailableRoot();

  if (!root) return;

  for (const key in predicates) {
    useUpdateCategoryInRegistry(root, key, predicates[key], isolate);
  }
}

/**
 * Retrieves isolates from the registry based on a category and an optional key.
 */
export function useGetFromRegistry(
  category: string,
  key?: string,
): Set<TIsolate> {
  const root = useGetAvailableRoot();
  if (!root) return new Set();

  const index = useEnsureRegistryIndex(root, category);

  if (key) {
    return index.get(key) ?? new Set();
  }

  const allNodes = new Set<TIsolate>();
  index.forEach(set => set.forEach(node => allNodes.add(node)));
  return allNodes;
}

/**
 * Checks if the registry contains any isolates for a given category and optional key.
 */
export function useHasFromRegistry(category: string, key?: string): boolean {
  return isNotEmptySet(useGetFromRegistry(category, key));
}

/**
 * Removes all entries for a specific key from the registry.
 */
export function useRemoveFieldFromRegistry(key: string): void {
  const root = useGetAvailableRoot();

  if (!root) return;

  useForEachRegistryIndex(root, index => index.delete(key));
}

/**
 * Clears all registry entries from the root isolate.
 */
export function useClearRegistry(root: TIsolate) {
  useForEachRegistryIndex(root, index => index.clear());
}

// Internal Helpers

const GENERIC_REGISTRY_KEY = '_generic';

function useGetAvailableRoot(): TIsolate | undefined {
  try {
    return useAvailableRoot();
  } catch {
    return undefined;
  }
}

function useUpdateCategoryInRegistry(
  root: TIsolate,
  category: string,
  config: RegistryCategoryConfig,
  isolate: TIsolate,
) {
  const isMatching = config.predicate(isolate);
  const index = useEnsureRegistryIndex(root, category);
  const key = config.getKey(isolate);

  if (isMatching) {
    useAddNodeToRegistryIndex(index, key, isolate);
  } else {
    useRemoveNodeFromRegistryIndex(index, key, isolate);
  }
}

function useEnsureRegistryIndex(
  root: TIsolate,
  category: string,
): RegistryIndex {
  const registryKey = `registry_${category}`;

  if (!root.data[registryKey]) {
    useDefineEnumerable(root.data, registryKey, new Map());
  }

  return root.data[registryKey];
}

function useForEachRegistryIndex(
  root: TIsolate,
  callback: (index: RegistryIndex) => void,
) {
  for (const key in root.data) {
    if (key.startsWith('registry_')) {
      callback(root.data[key]);
    }
  }
}

function useAddNodeToRegistryIndex(
  index: RegistryIndex,
  key: Nullable<string>,
  isolate: TIsolate,
) {
  const indexKey = key ?? GENERIC_REGISTRY_KEY;
  let entry = index.get(indexKey);

  if (!entry) {
    entry = new Set();
    index.set(indexKey, entry);
  }

  entry.add(isolate);
}

function useRemoveNodeFromRegistryIndex(
  index: RegistryIndex,
  key: Nullable<string>,
  isolate: TIsolate,
) {
  const indexKey = key ?? GENERIC_REGISTRY_KEY;
  const entry = index.get(indexKey);

  if (entry) {
    entry.delete(isolate);
    if (isEmptySet(entry)) {
      index.delete(indexKey);
    }
  }
}

function useDefineEnumerable(obj: any, key: string, value: any) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}
