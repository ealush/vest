import createState from 'vast';

import VestTest from 'VestTest';
import type { TDraftResult } from 'produceDraft';

export default function createStateRef(
  state: ReturnType<typeof createState>,
  { suiteId }: { suiteId: string }
) {
  return {
    carryOverTests: state.registerStateKey<VestTest[]>(() => []),
    lagging: state.registerStateKey<VestTest[]>(() => []),
    optionalFields: state.registerStateKey<Record<string, boolean>>(() => ({})),
    pending: state.registerStateKey<VestTest[]>(() => []),
    skippedTests: state.registerStateKey<VestTest[]>(() => []),
    suiteId: state.registerStateKey<string>(() => suiteId),
    testCallbacks: state.registerStateKey<{
      fieldCallbacks: Record<string, Array<(res: TDraftResult) => void>>;
      doneCallbacks: Array<(res: TDraftResult) => void>;
    }>(() => ({
      fieldCallbacks: {},
      doneCallbacks: [],
    })),
    testObjects: state.registerStateKey<VestTest[]>(() => []),
  };
}
