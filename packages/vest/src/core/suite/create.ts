import asArray from 'asArray';
import assign from 'assign';
import genId from 'genId';
import isFunction from 'isFunction';
import throwError from 'throwError';
import { createState } from 'vast';

import createStateRef from 'createStateRef';
import context from 'ctx';
import matchingFieldName from 'matchingFieldName';
import omitOptionalTests from 'omitOptionalTests';
import { IVestResult, produceFullResult } from 'produce';
import { produceDraft, TDraftResult } from 'produceDraft';
import { useTestObjects, usePrevTestObjects } from 'stateHooks';
import { initBus } from 'vestBus';

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
    throwError(
      'Suite initialization error. Expected `tests` to be a function.'
    );
  }

  const bus = initBus();
  const state = createState();

  const stateRef = createStateRef(state, { suiteId: genId() });

  interface IVestSuite {
    (...args: Parameters<T>): IVestResult;

    get: () => TDraftResult;
    reset: () => void;
    remove: (fieldName: string) => void;
  }

  const suite: IVestSuite = assign(
    context.bind({ stateRef, bus }, (...args: unknown[]) => {
      const [prevTestObjects] = useTestObjects();
      const [, setPrevTestObjects] = usePrevTestObjects();

      state.reset();
      setPrevTestObjects(() => prevTestObjects);

      // Run the consumer's callback
      suiteCallback(...args);
      omitOptionalTests();
      const res = produceFullResult();

      return res;
    }),
    {
      get: context.bind({ stateRef }, produceDraft),
      remove: context.bind({ stateRef }, name => {
        const [testObjects] = useTestObjects();

        // We're mutating the array in `cancel`, so we have to first copy it.
        asArray(testObjects).forEach(testObject => {
          if (matchingFieldName(testObject, name)) {
            testObject.cancel();
          }
        });
      }),
      reset: state.reset,
    }
  );

  return suite;
}
