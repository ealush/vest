import { createContext } from 'context';

import { Isolate } from './isolate';

const suiteRuntime = createContext<SuiteRuntime>();

type SuiteRuntime = {
  isolate: Isolate;
};

function useSuiteRuntime() {
  return suiteRuntime.useX();
}

function useIsolate() {
  return useSuiteRuntime().isolate;
}
