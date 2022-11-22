import { Isolate } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { createCascade } from 'context';
import { Modes } from 'mode';
import { assign, BusType, CB, TinyState, tinyState } from 'vest-utils';

import { OptionalFields } from 'OptionalTypes';
import { initVestBus } from 'VestBus';
import { createIsolate } from 'createIsolate';
import { SuiteResult } from 'suiteResult';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  const suiteRuntimeRoot = createIsolate();
  return assign(
    {
      VestBus: initVestBus(),
      doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
      exclusion: {
        tests: {},
        groups: {},
      },
      fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
      inclusion: {},
      isolate: suiteRuntimeRoot,
      mode: tinyState.createTinyState<Modes>(Modes.ALL),
      optional: {},
      suiteRuntimeRoot,
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
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteRuntimeRoot: Isolate;
  isolate?: Isolate;
  skipped?: boolean;
  omitted?: boolean;
  mode: TinyState<Modes>;
};

export function persist<T extends CB>(cb: T) {
  return SuiteContext.bind({ ...SuiteContext.useX() }, cb);
}

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;
export type DoneCallback = (res: SuiteResult) => void;

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

export function useDoneCallbacks() {
  return SuiteContext.useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return SuiteContext.useX().fieldCallbacks();
}

export function useSuiteRuntimeRoot() {
  return SuiteContext.useX().suiteRuntimeRoot;
}

export function useIsolate() {
  return SuiteContext.useX().isolate;
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
