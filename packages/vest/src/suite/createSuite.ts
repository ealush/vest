import { CB } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';


import { useCreateVestState } from '../core/Runtime';
import { useInitVestBus } from '../core/VestBus/VestBus';
import { VestReconciler } from '../core/isolate/VestReconciler';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';

import { Suite } from "./SuiteTypes";
import {
  bindSuiteLifecycle,
  useCreateSuiteMethods,
} from "./useCreateSuiteMethods";
import { validateSuiteCallback } from './validateParams/validateSuiteParams';

// @vx-allow use-use
/**
 * Creates a new Vest suite.
 *
 * @example
 * const suite = createSuite((data) => {
 *  test('field', 'message', () => {
 *    enforce(data.field).isNotEmpty();
 *  });
 * });
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @returns {Suite} - The created suite.
 */
function createSuite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: T): Suite<F, G, T> {
  validateSuiteCallback(suiteCallback);

  // Create a stateRef for the suite
  // It holds the suite's persisted values that may remain between runs.
  const stateRef = useCreateVestState({ VestReconciler });

  // Assign methods to the suite
  // We do this within the VestRuntime so that the suite methods
  // will be bound to the suite's stateRef and be able to access it.
  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();
    return createSuiteInstance();

    function createSuiteInstance(): Suite<F, G, T> {
      const methods = useCreateSuiteMethods<F, G, T>(
        suiteCallback,
        {
          only: undefined,
        },
        VestBus.subscribe,
      );

      return bindSuiteLifecycle(methods);
    }
  });
}

export { createSuite };
