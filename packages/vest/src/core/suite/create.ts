import assign from 'assign';
import genId from 'genId';
import isFunction from 'isFunction';
import throwError from 'throwError';
import { createState } from 'vast';

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

type CB = (...args: any[]) => void;

type SuiteReturnType<T extends CB> = {
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
function create<T extends CB>(
  suiteName: string,
  suiteCallback: T
): SuiteReturnType<T>;
function create<T extends CB>(suiteCallback: T): SuiteReturnType<T>;
// eslint-disable-next-line max-lines-per-function
function create<T extends CB>(
  ...args: [suiteName: string, suiteCallback: T] | [suiteCallback: T]
): SuiteReturnType<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, string];

  if (!isFunction(suiteCallback)) {
    throwError('vest.create: Expected callback to be a function.');
  }

  // Event bus initialization
  const bus = initBus();

  // State initialization
  const state = createState();

  // State reference - this holds the actual state values
  const stateRef = createStateRef(state, { suiteId: genId(), suiteName });

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
