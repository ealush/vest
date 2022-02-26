import type { NestedArray } from 'nestedArray';
import type { TState } from 'vast';

import VestTest from 'VestTest';
import type { SuiteResult } from 'produceSuiteResult';

export default function createStateRef(
  state: TState,
  { suiteId, suiteName }: { suiteId: string; suiteName?: void | string }
) {
  return {
    optionalFields: state.registerStateKey<
      Record<string, (() => boolean) | boolean>
    >(() => ({})),
    suiteId: state.registerStateKey<string>(suiteId),
    suiteName: state.registerStateKey<string | void>(suiteName),
    testCallbacks: state.registerStateKey<{
      fieldCallbacks: Record<string, Array<(res: SuiteResult) => void>>;
      doneCallbacks: Array<(res: SuiteResult) => void>;
    }>(() => ({
      fieldCallbacks: {},
      doneCallbacks: [],
    })),
    testObjects: state.registerStateKey<{
      prev: NestedArray<VestTest>;
      current: NestedArray<VestTest>;
    }>(prev => {
      return {
        prev: prev ? prev.current : [],
        current: [] as NestedArray<VestTest>,
      };
    }),
  };
}

export type TStateRef = ReturnType<typeof createStateRef>;
