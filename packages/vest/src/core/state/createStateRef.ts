import type { NestedArray } from 'nestedArray';
import type { TState } from 'vast';

import VestTest from 'VestTest';
import type { TDraftResult } from 'produceDraft';

export default function createStateRef(
  state: TState,
  { suiteId }: { suiteId: string }
) {
  return {
    optionalFields: state.registerStateKey<
      Record<string, (() => boolean) | boolean>
    >(() => ({})),
    suiteId: state.registerStateKey<string>(suiteId),
    testCallbacks: state.registerStateKey<{
      fieldCallbacks: Record<string, Array<(res: TDraftResult) => void>>;
      doneCallbacks: Array<(res: TDraftResult) => void>;
    }>(() => ({
      fieldCallbacks: {},
      doneCallbacks: [],
    })),
    testObjects: state.registerStateKey<{
      prev: NestedArray<VestTest>;
      current: NestedArray<VestTest>;
    }>(prev => {
      return {
        prev: (prev ? prev.current : []) as NestedArray<VestTest>,
        current: [] as NestedArray<VestTest>,
      };
    }),
  };
}

export type TStateRef = ReturnType<typeof createStateRef>;
