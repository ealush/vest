import { createState } from 'vast';
import type { CB } from 'vest-utils';
import { assign, seq, invariant, isFunction } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import createStateRef from 'createStateRef';
import context from 'ctx';
import { isolate } from 'isolate';
import { produceSuiteResult, SuiteResult } from 'produceSuiteResult';
import { SuiteRunResult, produceFullResult } from 'produceSuiteRunResult';
import { initBus, Events } from 'vestBus';

type CreateProperties = {
  get: () => SuiteResult;
  reset: () => void;
  resetField: (fieldName: string) => void;
  remove: (fieldName: string) => void;
};

export type Suite<T extends CB> = {
  (...args: Parameters<T>): SuiteRunResult;
} & CreateProperties;

/**
 * Creates a new validation suite
 *
 * @example
 *
 * const suite = create((data = {}) => {
 *  test("username", "Username is required", () => {
 *    enforce(data.username).isNotBlank();
 *  });
 * });
 */
function create<T extends CB>(suiteName: SuiteName, suiteCallback: T): Suite<T>;
function create<T extends CB>(suiteCallback: T): Suite<T>;
// eslint-disable-next-line max-lines-per-function
function create<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  invariant(
    isFunction(suiteCallback),
    'vest.create: Expected callback to be a function.'
  );

  // Event bus initialization
  const bus = initBus();

  // State initialization
  const state = createState();

  // State reference - this holds the actual state values
  const stateRef = createStateRef(state, { suiteId: seq(), suiteName });

  interface IVestSuite {
    (...args: Parameters<T>): SuiteRunResult;

    get: () => SuiteResult;
    reset: () => void;
    resetField: (fieldName: string) => void;
    remove: (fieldName: string) => void;
  }

  // Create base context reference. All hooks will derive their data from this
  const ctxRef = { stateRef, bus };

  const suite: IVestSuite = assign(
    // Bind the suite body to the context
    context.bind(ctxRef, (...args: unknown[]) => {
      // Reset the state. Migrates current test objects to `prev` array.
      state.reset();

      // Create a top level isolate
      isolate({ type: IsolateTypes.SUITE }, () => {
        // Run the consumer's callback
        suiteCallback(...args);
      });

      // Report the suite is done registering tests
      // Async tests may still be running
      bus.emit(Events.SUITE_CALLBACK_DONE_RUNNING);

      // Return the result
      return produceFullResult();
    }),
    {
      get: context.bind(ctxRef, produceSuiteResult),
      remove: context.bind(ctxRef, (fieldName: string) => {
        bus.emit(Events.REMOVE_FIELD, fieldName);
      }),
      reset: state.reset,
      resetField: context.bind(ctxRef, (fieldName: string) => {
        bus.emit(Events.RESET_FIELD, fieldName);
      }),
    }
  );

  return suite;
}

export default create;

export type SuiteName = string | void;
