import { createContext } from 'context';

import { Isolate } from 'isolateTypes';

export const SuiteRuntimeContext = createContext<Isolate>();
export const SuiteRuntimeRootContext = createContext<Isolate>();

function useSuiteRuntime() {
  return SuiteRuntimeContext.use();
}

export function useIsolate() {
  return useSuiteRuntime();
}
