import type { NestedArray } from 'nestedArray';
import type { State } from 'vast';

import VestTest from 'VestTest';
import type { SuiteResult } from 'produceSuiteResult';

export default function createStateRef(
  state: State,
  { suiteId, suiteName }: { suiteId: string; suiteName?: void | string }
) {
  return {
    optionalFields: state.registerStateKey<
      Record<string, [rule: (() => boolean) | boolean, isApplied: boolean]>
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

export type StateRef = ReturnType<typeof createStateRef>;

type StateKeys = keyof StateRef;

export type StateKey<T extends StateKeys> = ReturnType<StateRef[T]>;
export type StateValue<T extends StateKeys> = StateKey<T>[0];
export type StateSetter<T extends StateKeys> = StateKey<T>[1];
