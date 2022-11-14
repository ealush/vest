import { createContext } from 'context';

import { Isolate } from 'isolateTypes';

export const suiteRuntime = createContext<SuiteRuntime>();

type SuiteRuntime = Isolate<undefined>;

function useSuiteRuntime() {
  return suiteRuntime.use();
}

export function useIsolate() {
  return useSuiteRuntime();
}
