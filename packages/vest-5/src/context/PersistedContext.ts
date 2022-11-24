import { createCascade } from 'context';
import { assign, CB, tinyState, TinyState } from 'vest-utils';

import { SuiteResult } from 'suiteResult';

export const PersistedContext = createCascade<CTXType>(
  (ctxRef, parentContext) => {
    if (parentContext) {
      return null;
    }

    return assign(
      {
        doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
        fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
      },
      ctxRef
    );
  }
);

export function PersistedContextProvider<T extends CB>(cb: CB): T {
  // @ts-ignore
  return PersistedContext.bind({}, cb);
}

type CTXType = {
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
};

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;
export type DoneCallback = (res: SuiteResult) => void;

export function useDoneCallbacks() {
  return PersistedContext.useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return PersistedContext.useX().fieldCallbacks();
}
