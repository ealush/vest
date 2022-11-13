import { createContext } from 'context';

import { createIsolate } from './createIsolate';
import { Isolate } from './isolateTypes';

const suiteRuntime = createContext<SuiteRuntime>({
  isolate: createIsolate(),
});

type SuiteRuntime = {
  isolate: Isolate;
};

function useSuiteRuntime() {
  return suiteRuntime.useX();
}

export function useIsolate() {
  return useSuiteRuntime().isolate;
}
