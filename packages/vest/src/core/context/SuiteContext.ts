import { createCascade } from 'context';
import {
  assign,
  TinyState,
  tinyState,
  cache,
  CacheApi,
  DynamicValue,
} from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { Modes } from 'Modes';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  return assign(
    {
      inclusion: {},
      mode: tinyState.createTinyState<Modes>(Modes.EAGER),
      suiteParams: [],
      testMemoCache,
    },
    ctxRef,
  );
});

type CTXType = {
  inclusion: Record<string, DynamicValue<boolean>>;
  mode: TinyState<Modes>;
  suiteParams: any[];
  testMemoCache: CacheApi<TIsolateTest>;
  currentTest?: TIsolateTest;
  groupName?: string;
  skipped?: boolean;
  omitted?: boolean;
};

export function useCurrentTest(msg?: string) {
  return SuiteContext.useX(msg).currentTest;
}

export function useGroupName() {
  return SuiteContext.useX().groupName;
}

export function useInclusion() {
  return SuiteContext.useX().inclusion;
}

export function useMode() {
  return SuiteContext.useX().mode();
}

export function useSkipped() {
  return SuiteContext.useX().skipped ?? false;
}

export function useOmitted() {
  return SuiteContext.useX().omitted ?? false;
}

const testMemoCache = cache<TIsolateTest>(10);

export function useTestMemoCache() {
  return SuiteContext.useX().testMemoCache;
}

export function useSuiteParams() {
  return SuiteContext.useX().suiteParams;
}
