import { Isolate } from 'IsolateTypes';
import { createCascade } from 'context';
import {
  assign,
  invariant,
  tinyState,
  TinyState,
  deferThrow,
  isNullish,
  CB,
} from 'vest-utils';

import { OptionalFields } from 'OptionalTypes';
import { SuiteResult } from 'SuiteResultTypes';

export const PersistedContext = createCascade<CTXType>(
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(vestState.historyRoot);

    const [historyRoot] = vestState.historyRoot();

    return assign(
      {
        historyNody: historyRoot,
        optional: {},
        runtimeNode: null,
        runtimeRoot: null,
      },
      vestState
    ) as CTXType;
  }
);

export function createVestState({
  suiteName,
}: {
  suiteName?: string;
}): StateType {
  return {
    doneCallbacks: tinyState.createTinyState<DoneCallbacks>([]),
    fieldCallbacks: tinyState.createTinyState<FieldCallbacks>({}),
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
    suiteName,
  };
}

export function persist<T extends CB>(cb: T): T {
  return PersistedContext.bind({ ...PersistedContext.useX() }, cb);
}

type CTXType = StateType & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
  optional: OptionalFields;
};

type StateType = {
  historyRoot: TinyState<Isolate | null>;
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
  suiteName: string | undefined;
};

type FieldCallbacks = Record<string, DoneCallbacks>;
type DoneCallbacks = Array<DoneCallback>;
export type DoneCallback = (res: SuiteResult) => void;

export function useOptionalFields(): OptionalFields {
  return PersistedContext.useX().optional;
}

export function useOptionalField(fieldName: string) {
  return useOptionalFields()[fieldName] ?? {};
}

export function useDoneCallbacks() {
  return PersistedContext.useX().doneCallbacks();
}

export function useFieldCallbacks() {
  return PersistedContext.useX().fieldCallbacks();
}

export function useHistoryRoot() {
  return PersistedContext.useX().historyRoot();
}

export function useHistoryNode() {
  return PersistedContext.useX().historyNode;
}

export function useSuiteName() {
  return PersistedContext.useX().suiteName;
}

export function useSetHistory(history: Isolate) {
  const context = PersistedContext.useX();

  const [, setHistoryRoot] = context.historyRoot();

  setHistoryRoot(history);
}

export function useHistoryKeyValue(key?: string | null) {
  if (isNullish(key)) {
    return;
  }

  const historyNode = PersistedContext.useX().historyNode;

  return historyNode?.keys[key];
}

export function useIsolate() {
  return PersistedContext.useX().runtimeNode ?? null;
}

export function useRuntimeRoot() {
  return PersistedContext.useX().runtimeRoot;
}

export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, 'Not within an active isolate');

  currentIsolate.children[currentIsolate.cursor++] = child;
}

export function useSetIsolateKey(key: string | undefined, value: any): void {
  if (!key) {
    return;
  }

  const currentIsolate = useIsolate();

  invariant(currentIsolate, 'Not within an active isolate');

  if (isNullish(currentIsolate.keys[key])) {
    currentIsolate.keys[key] = value;

    return;
  }

  deferThrow(
    `Encountered the same test key "${key}" twice. This may lead to tests overriding each other's results, or to tests being unexpectedly omitted.`
  );
}
