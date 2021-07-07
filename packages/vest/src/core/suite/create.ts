import asArray from 'asArray';
import genId from 'genId';
import isFunction from 'isFunction';
import throwError from 'throwError';
import createState from 'vast';

import createStateRef from 'createStateRef';
import context from 'ctx';
import { IVestResult, produceFullResult } from 'produce';
import { produceDraft, TDraftResult } from 'produceDraft';
import {
  usePending,
  useTestObjects,
  useCarryOverTests,
  useLagging,
} from 'stateHooks';


export default function create<T extends (...args: any[]) => void>(
  suiteCallback: T
): {
  (...args: Parameters<T>): IVestResult;

  get: () => TDraftResult;
  reset: () => void;
  remove: (fieldName: string) => void;
  subscribe: (handler: () => void) => void;
} {
  if (!isFunction(suiteCallback)) {
    throwError(
      'Suite initialization error. Expected `tests` to be a function.'
    );
  }

  const handlers: ((...args: unknown[]) => void)[] = [];
  const state = createState(() => {
    handlers.forEach(fn =>
      fn({
        suiteState: stateRef,
        type: 'suiteStateUpdate',
      })
    );
  });

  const stateRef = createStateRef(state, { suiteId: genId() });

  interface IVestSuite {
    (...args: Parameters<T>): IVestResult;

    get: () => TDraftResult;
    reset: () => void;
    remove: (fieldName: string) => void;
    subscribe: (handler: () => void) => void;
  }

  const suite: IVestSuite = Object.assign(
    context.bind({ stateRef }, (...args: unknown[]) => {
      const [previousTestObjects] = useTestObjects();
      const [, setCarryOverTests] = useCarryOverTests();
      const [pending] = usePending();
      const [prevLagging, setLagging] = useLagging();
      state.reset();
      setCarryOverTests(() => previousTestObjects);

      // Move all the active pending tests to the lagging array
      setLagging(pending.concat(prevLagging));

      // Run the consumer's callback
      suiteCallback(...args);

      const res = produceFullResult();

      return res;
    }),
    {
      get: context.bind({ stateRef }, produceDraft),
      remove: context.bind({ stateRef }, name => {
        const [testObjects] = useTestObjects();

        // We're mutating the array in `cancel`, so we have to first copy it.
        asArray(testObjects).forEach(testObject => {
          if (testObject.fieldName === name) {
            testObject.cancel();
          }
        });
      }),
      reset: state.reset,
      subscribe(
        handler: (stateEvent: {
          type: string;
          suiteState: typeof stateRef;
        }) => void
      ) {
        if (!isFunction(handler)) return;

        handlers.push(handler);

        handler({
          type: 'suiteSubscribeInit',
          suiteState: stateRef,
        });
      },
    }
  );

  return suite;
}
