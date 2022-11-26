import { createCascade } from 'context';
import { assign, BusType, TinyState, tinyState } from 'vest-utils';

import { OptionalFields } from 'OptionalTypes';
import { initVestBus } from 'VestBus';
import { VestTest } from 'VestTest';
import { Modes } from 'mode';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  return assign(
    {
      VestBus: initVestBus(),
      exclusion: {
        tests: {},
        groups: {},
      },
      inclusion: {},
      mode: tinyState.createTinyState<Modes>(Modes.ALL),
      optional: {},
    },
    ctxRef
  );
});

type CTXType = {
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  inclusion: Record<string, boolean | (() => boolean)>;
  currentTest?: VestTest;
  groupName?: string;
  optional: OptionalFields;
  VestBus: BusType;
  skipped?: boolean;
  omitted?: boolean;
  mode: TinyState<Modes>;
};

export function useCurrentTest() {
  return SuiteContext.useX().currentTest;
}

export function useGroupName() {
  return SuiteContext.useX().groupName;
}

export function useOptionalFields(): OptionalFields {
  return SuiteContext.useX().optional;
}

export function useOptionalField(fieldName: string) {
  return useOptionalFields()[fieldName] ?? {};
}

export function useVestBus() {
  return SuiteContext.useX().VestBus;
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
