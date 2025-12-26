import {
  IsolateRegistry,
  RegistryCategoryConfig,
  TIsolate,
} from 'vestjs-runtime';

import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../isolate/IsolateTest/VestTest';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';

/**
 * Represents the categories of isolates tracked within the registry.
 */
export type IsolateCategory =
  | 'all'
  | 'failed'
  | 'omitted'
  | 'passing'
  | 'pending'
  | 'tested'
  | 'valid'
  | 'warning';

/**
 * A predicate function used to determine if an isolate belongs to a given category.
 */
type IsolatePredicate = (isolate: TIsolate) => boolean;

/**
 * Helper to extract field name from test isolate.
 */
const getFieldName = (isolate: TIsolate): TFieldName =>
  (isolate as TIsolateTest).data?.fieldName;

/**
 * Helper to create a predicate that first checks if an isolate is a VestTest.
 */
const isTestAnd =
  (predicate: (isolate: TIsolateTest) => boolean): IsolatePredicate =>
  (isolate: TIsolate) =>
    VestTest.is(isolate) && predicate(isolate as TIsolateTest);

/**
 * Set of predicates used to categorize isolates.
 */
const RegistryPredicates: Record<IsolateCategory, RegistryCategoryConfig> = {
  all: {
    getKey: getFieldName,
    predicate: isTestAnd(() => true),
  },
  failed: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isFailing(isolate).unwrap()),
  },
  omitted: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isOmitted(isolate).unwrap()),
  },
  passing: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isPassing(isolate).unwrap()),
  },
  pending: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isStarted(isolate).unwrap()),
  },
  tested: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isTested(isolate).unwrap()),
  },
  valid: {
    getKey: getFieldName,
    predicate: isTestAnd(
      isolate =>
        VestTest.isPassing(isolate).unwrap() ||
        VestTest.isWarning(isolate).unwrap(),
    ),
  },
  warning: {
    getKey: getFieldName,
    predicate: isTestAnd(isolate => VestTest.isWarning(isolate).unwrap()),
  },
};

/**
 * Updates the registration of an isolate in all relevant characteristic indices.
 *
 * This function is called reactively whenever an isolate is registered or its state changes.
 * It re-evaluates all known predicates and ensures the isolate is correctly added to or
 * removed from the corresponding registry maps.
 *
 * @param isolate - The isolate node to update in the registry.
 */
export function useUpdateRegistry(isolate: TIsolate) {
  IsolateRegistry.useUpdateRegistry(isolate, RegistryPredicates);
}

/**
 * Accessor for the registry. Retrieves isolates indexed under a specific characteristic.
 *
 * @param category - The characteristic category to look up (e.g., 'failed', 'pending').
 * @param fieldName - Optional field name to filter the results by.
 * @returns A Set containing the isolates that currently match the characteristic.
 *
 * @example
 * ```typescript
 * // Get all failed tests for the 'email' field
 * const failedEmailTests = useGetFromRegistry('failed', 'email');
 * ```
 */
export function useGetFromRegistry(
  category: IsolateCategory,
  fieldName?: string,
): Set<TIsolate> {
  return IsolateRegistry.useGetFromRegistry(category, fieldName);
}

/**
 * Checks if the registry contains any isolates for a given category and optional field name.
 *
 * @param category - The category to check for.
 * @param fieldName - The name of the field to check for.
 * @returns true if the registry contains matching isolates.
 */
export function useHasFromRegistry(
  category: IsolateCategory,
  fieldName?: string,
): boolean {
  return IsolateRegistry.useHasFromRegistry(category, fieldName);
}

/**
 * Removes all entries for a specific field name from the registry.
 * This is useful when a field is removed from the suite and its state should be cleared.
 *
 * @param fieldName - The name of the field to remove from the registry.
 */
export function useRemoveFieldFromRegistry(fieldName: string): void {
  IsolateRegistry.useRemoveFieldFromRegistry(fieldName);
}

/**
 * Initializes registry event listeners.
 *
 * @param bus - The event bus to subscribe to.
 */
export function useRegistryBusEvents(bus: any) {
  // We're listening to the REMOVE_FIELD event to ensure the registry
  // stays in sync when a field is removed from the suite.
  bus.on('REMOVE_FIELD', (fieldName: string) => {
    useRemoveFieldFromRegistry(fieldName);
  });
}

/**
 * Clears all registry indices from the root isolate.
 * This is primarily used during tree reprocessing to ensure a clean slate
 * before rebuilding the registry from the current tree state.
 *
 * @param root - The suite's root isolate containing the registry.
 */
export function useClearRegistry(root: TIsolate) {
  IsolateRegistry.useClearRegistry(root);
}
