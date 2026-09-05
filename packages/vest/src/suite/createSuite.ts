import { assertSchemaRootPathsValid } from 'n4s';
import { CB, makeResult, Result } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { useCreateVestState } from '../core/Runtime';
import { useInitVestBus } from '../core/VestBus/VestBus';
import { VestReconciler } from '../core/isolate/VestReconciler';
import {
  InferSchemaOutput,
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

import { Suite, SuiteCallbackWithSchema } from './SuiteTypes';
import {
  useBindSuiteLifecycle,
  useCreateSuiteMethods,
} from './useCreateSuiteMethods';
import { validateSuiteCallback } from './validateSuiteCallback/validateSuiteCallback';

export type SuiteConfig = {
  fields: string;
  groups?: string;
};

// @vx-allow use-use
function createSuite<_Escape>(
  suiteCallback: [_Escape] extends [null] ? CB : never,
  schema?: any,
): [_Escape] extends [null] ? Suite<TFieldName, TGroupName, CB, any> : never;
// @vx-allow use-use
function createSuite<
  C extends SuiteConfig,
  Data = any,
  T extends (data: Data, ...args: any[]) => void = (
    data: Data,
    ...args: any[]
  ) => void,
>(
  suiteCallback: T,
  schema?: undefined,
): Suite<
  C['fields'],
  C['groups'] extends string ? C['groups'] : string,
  T,
  undefined
>;
// @vx-allow use-use
function createSuite<
  S extends TSchema,
  T extends (data: InferSchemaOutput<S>, ...args: any[]) => void = (
    data: InferSchemaOutput<S>,
    ...args: any[]
  ) => void,
>(
  suiteCallback: T,
  schema: S,
): Suite<Extract<keyof InferSchemaOutput<S>, string>, TGroupName, T, S>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: SuiteCallbackWithSchema<S, T>, schema?: S): Suite<F, G, T, S>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: T, schema?: S): Suite<F, G, T, S> {
  const suiteCallbackResult = validateSuiteCallback(suiteCallback).unwrap();
  if (schema) {
    // Deferred ($.root) relationship endpoints are validated by n4s against
    // the final mounted graph.
    assertSchemaRootPathsValid(schema);
  }

  const stateRef = useCreateVestState({ VestReconciler });

  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();

    return createSuiteInstance().unwrap();

    function createSuiteInstance(): Result<Suite<F, G, T, S>> {
      const methods = useCreateSuiteMethods<F, G, T, S>(
        suiteCallbackResult as SuiteCallbackWithSchema<S, T>,
        {},
        VestBus.subscribe,
        schema,
      );

      return makeResult.Ok(useBindSuiteLifecycle(methods));
    }
  });
}

export { createSuite };
