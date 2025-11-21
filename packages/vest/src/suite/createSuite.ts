/* eslint-disable max-lines-per-function */
import { CB } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { useCreateVestState } from '../core/Runtime';
import { useInitVestBus } from '../core/VestBus/VestBus';
import { VestReconciler } from '../core/isolate/VestReconciler';
import {
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

import { Suite } from './SuiteTypes';
import {
  bindSuiteLifecycle,
  useCreateSuiteMethods,
} from './useCreateSuiteMethods';
import { validateSuiteCallback } from './validateParams/validateSuiteParams';

// @vx-allow use-use
function createSuite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: T, schema?: S): Suite<F, G, T, S>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: T, schema?: S): Suite<F, G, T, S> {
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

    function createSuiteInstance(): Suite<F, G, T, S> {
      const methods = useCreateSuiteMethods<F, G, T, S>(
        suiteCallback,
        {
          only: undefined,
        },
        VestBus.subscribe,
        schema,
      );

      return bindSuiteLifecycle(methods);
    }
  });
}

export { createSuite };
