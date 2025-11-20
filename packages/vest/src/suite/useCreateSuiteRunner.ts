import { assign, CB, withResolvers } from 'vest-utils';
import { Bus } from 'vestjs-runtime';


import { SuiteContext } from '../core/context/SuiteContext';
import { IsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { only } from '../hooks/focused/focused';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { SuiteModifiers } from './SuiteTypes';

/**
 * Creates the actual suite runner function.
 * This function is responsible for initializing the suite context,
 * running the suite callback, and returning the result.
 *
 * @param {Function} suiteCallback - The body of the suite.
 * @param {Object} modifiers - The modifiers for the suite (e.g., only).
 * @returns {Function} - The suite runner function.
 */
export function useCreateSuiteRunner<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
>(suiteCallback: CB, modifiers: SuiteModifiers<F>) {
  return function runSuite(...args: Parameters<T>): SuiteResult<F, G> {
    const { resolve, promise } = withResolvers<SuiteResult<F, G>>();
    return assign(
      promise,
      SuiteContext.run(
        {
          suiteParams: args,
        },
        () => {
          Bus.useEmit('SUITE_RUN_STARTED');

          function resolver() {
            const result = useCreateSuiteResult<F, G>();
            resolve(result);
            return result;
          }

          return IsolateSuite(() => {
            only(modifiers.only);
            suiteCallback(...args);
            Bus.useEmit('SUITE_CALLBACK_RUN_FINISHED');
            return useCreateSuiteResult<F, G>();
          }, resolver);
        },
      ).output,
    );
  };
}
