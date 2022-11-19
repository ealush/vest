import { VestTest } from 'VestTest';
import { createCascade } from 'context';
import { assign } from 'vest-utils';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : assign(
        {
          exclusion: {
            tests: {},
            groups: {},
          },
          inclusion: {},
        },
        ctxRef
      )
);

type CTXType = {
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  inclusion: Record<string, boolean | (() => boolean)>;
  currentTest?: VestTest;
  groupName?: string;
  // skipped?: boolean;
  // omitted?: boolean;
};

export function useCurrentTest() {
  return SuiteContext.useX().currentTest;
}

export function useGroupName() {
  return SuiteContext.useX().groupName;
}
