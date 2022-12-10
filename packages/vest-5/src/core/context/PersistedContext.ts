import { Isolate } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { createCascade } from 'context';
import { createState, UseState } from 'vast';
import {
  assign,
  invariant,
  deferThrow,
  isNullish,
  CB,
  seq,
  cache,
  TinyState,
  tinyState,
} from 'vest-utils';
import { CacheApi } from 'vest-utils/src/vest-utils';

import { OptionalFields } from 'OptionalTypes';
import { SuiteResult } from 'SuiteResultTypes';

export const PersistedContext = createCascade<CTXType>(
  (vestState, parentContext) => {
    if (parentContext) {
      return null;
    }

    invariant(vestState.historyRoot);

    const [historyRootNode] = vestState.historyRoot();

    return assign(
      {
        doneCallbacks: tinyState.createTinyState<DoneCallbacks>(() => []),
        fieldCallbacks: tinyState.createTinyState<FieldCallbacks>(() => ({})),
        historyNode: historyRootNode,
        optional: {},
        runtimeNode: null,
        runtimeRoot: null,
      },
      vestState
    ) as CTXType;
  }
);

export function createVestState({ suiteName }: { suiteName?: string }) {
  const state = createState();

  const stateRef = {
    historyRoot: state.registerStateKey<Isolate | null>(null),
    optional: {},
    suiteId: seq(),
    suiteName,
    testMemoCache: cache<VestTest>(10),
  };

  return { state, stateRef };
}

export function persist<T extends CB>(cb: T): T {
  return PersistedContext.bind(PersistedContext.useX(), cb);
}

type CTXType = StateType & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
  testMemoCache: CacheApi<VestTest>;
  doneCallbacks: TinyState<DoneCallbacks>;
  fieldCallbacks: TinyState<FieldCallbacks>;
};

type StateType = {
  historyRoot: UseState<Isolate | null>;
  suiteName: string | undefined;
  suiteId: string;
  optional: OptionalFields;
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

export function useSuiteId() {
  return PersistedContext.useX().suiteId;
}

export function useTestMemoCache() {
  return PersistedContext.useX().testMemoCache;
}

export function useSetHistory(history: Isolate) {
  const context = PersistedContext.useX();

  const [, setHistoryRoot] = context.historyRoot();
  setHistoryRoot(history);
}

export function useHistoryKey(key?: string | null): Isolate | null {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = PersistedContext.useX().historyNode;

  return historyNode?.keys[key] ?? null;
}

export function useIsolate() {
  return PersistedContext.useX().runtimeNode ?? null;
}

export function useCurrentCursor() {
  return useIsolate()?.cursor ?? 0;
}

export function useRuntimeRoot() {
  return PersistedContext.useX().runtimeRoot;
}

export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, 'Not within an active isolate');

  currentIsolate.children[currentIsolate.cursor++] = child;
}

export function useSetIsolateKey(
  key: string | undefined,
  value: Isolate
): void {
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
