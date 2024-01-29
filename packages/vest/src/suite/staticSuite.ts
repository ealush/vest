import { CB, assign } from 'vest-utils';

import { TIsolateSuite } from 'IsolateSuite';
import { SuiteRunResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { createSuite } from 'createSuite';
import { TTypedMethods, getTypedMethods } from 'getTypedMethods';

/**
 * Creates a static suite for server-side validation.
 *
 * @param {Function} validationFn - The validation function that defines the suite's tests.
 * @returns {Function} - A function that runs the validations defined in the suite.
 *
 * @example
 * import { staticSuite, test, enforce } from 'vest';
 *
 * const suite = staticSuite(data => {
 *   test('username', 'username is required', () => {
 *     enforce(data.username).isNotEmpty();
 *   });
 * });
 *
 * suite(data);
 */
export function staticSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB,
>(suiteCallback: T): StaticSuite<F, G, T> {
  return assign(
    (...args: Parameters<T>) => {
      const suite = createSuite<F, G, T>(suiteCallback);

      const result = suite(...args);

      return Object.freeze(
        assign(
          {
            dump: suite.dump,
          },
          result,
        ),
      );
    },
    {
      ...getTypedMethods<F, G>(),
    },
  );
}

export type StaticSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB,
> = ((...args: Parameters<T>) => SuiteRunResult<F, G> & {
  dump: CB<TIsolateSuite>;
}) &
  TTypedMethods<F, G>;
