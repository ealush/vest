import assign from 'assign';
import genId from 'genId';
import isFunction from 'isFunction';
import throwError from 'throwError';
import { createState } from 'vast';

import { IsolateTypes } from 'IsolateTypes';
import createStateRef from 'createStateRef';
import context from 'ctx';
import { isolate } from 'isolate';
import { IVestResult, produceFullResult } from 'produce';
import { produceDraft, TDraftResult } from 'produceDraft';
import { initBus, Events } from 'vestBus';

// eslint-disable-next-line max-lines-per-function
export default function create<T extends (...args: any[]) => void>(
  suiteCallback: T
): {
  (...args: Parameters<T>): IVestResult;

  get: () => TDraftResult;
  reset: () => void;
  remove: (fieldName: string) => void;
} {
  if (!isFunction(suiteCallback)) {
    throwError('vest.create: Expected callback to be a function.');
  }

  // Event bus initialization
  const bus = initBus();

  // State initialization
  const state = createState();

  // State reference - this holds the actual state values
  const stateRef = createStateRef(state, { suiteId: genId() });

  interface IVestSuite {
    (...args: Parameters<T>): IVestResult;

    get: () => TDraftResult;
    reset: () => void;
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
      bus.emit(Events.SUITE_COMPLETED);

      // Return the result
      return produceFullResult();
    }),
    {
      get: context.bind(ctxRef, produceDraft),
      reset: state.reset,
      remove: context.bind(ctxRef, (fieldName: string) => {
        bus.emit(Events.REMOVE_FIELD, fieldName);
      }),
    }
  );

  return suite;
}
