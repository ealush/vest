import { VestTest } from 'VestTest';
import { createContext } from 'context';

import { Isolate } from 'isolateTypes';

export const SuiteRuntimeContext = createContext<Isolate>();
export const SuiteRuntimeRootContext = createContext<Isolate>();
export const CurrentTestContext = createContext<VestTest | undefined>(
  undefined
);
export const CurrentGroupContext = createContext<string | undefined>(undefined);

function useSuiteRuntime() {
  return SuiteRuntimeContext.use();
}

export function useIsolate() {
  return useSuiteRuntime();
}

export function useCurrentTest() {
  return CurrentTestContext.use();
}

export function useCurrentGroup() {
  return CurrentGroupContext.use();
}
