import { createCascade } from 'context';
import { assign, TinyState, tinyState, cache, CacheApi } from 'vest-utils';

import { VestTest } from 'VestTest';
import { Modes } from 'mode';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  return assign(
    {
      exclusion: {
        tests: {},
        groups: {},
      },
      inclusion: {},
      mode: tinyState.createTinyState<Modes>(Modes.ALL),
      testMemoCache,
    },
    ctxRef
  );
});

type CTXType = {
  exclusion: TExclusion;
  inclusion: Record<string, boolean | (() => boolean)>;
  currentTest?: VestTest;
  groupName?: string;
  skipped?: boolean;
  omitted?: boolean;
  mode: TinyState<Modes>;
  testMemoCache: CacheApi<VestTest>;
};

export type TExclusion = {
  tests: Record<string, boolean>;
  groups: Record<string, boolean>;
};

export function useCurrentTest(msg?: string) {
  return SuiteContext.useX(msg).currentTest;
}

export function useGroupName() {
  return SuiteContext.useX().groupName;
}

export function useExclusion(hookError?: string) {
  return SuiteContext.useX(hookError).exclusion;
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

const testMemoCache = cache<VestTest>(10);

export function useTestMemoCache() {
  return SuiteContext.useX().testMemoCache;
}
