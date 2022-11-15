import { createContext } from 'context';

import { VestTest } from 'VestTest';
import { Isolate } from 'isolateTypes';

export const suiteRuntime = createContext<SuiteRuntime>();
export const currentTest = createContext<VestTest | undefined>(undefined);
export const currentGroup = createContext<string | undefined>(undefined);

type SuiteRuntime = Isolate<unknown>;

function useSuiteRuntime() {
  return suiteRuntime.use();
}

export function useIsolate() {
  return useSuiteRuntime();
}

export function useCurrentTest() {
  return currentTest.use();
}

export function useCurrentGroup() {
  return currentGroup.use();
}
