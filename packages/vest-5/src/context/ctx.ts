import { VestTest } from 'VestTest';
import { createContext } from 'context';
import { Isolate } from 'isolateTypes';

export const suiteRuntime = createContext<SuiteRuntime>();
export const currentTest = createContext<VestTest | undefined>(undefined);
export const currentGroup = createContext<string | undefined>(undefined);

type SuiteRuntime = Isolate;

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
