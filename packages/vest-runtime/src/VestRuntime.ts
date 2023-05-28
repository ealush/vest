import { ErrorStrings } from 'ErrorStrings';
import { createCascade } from 'context';
import {
  invariant,
  deferThrow,
  isNullish,
  CB,
  assign,
  TinyState,
  text,
  optionalFunctionValue,
  tinyState,
} from 'vest-utils';

import { Isolate } from 'Isolate';

type CTXType = StateRefType & {
  historyNode: Isolate | null;
  runtimeNode: Isolate | null;
  runtimeRoot: Isolate | null;
  stateRef: StateRefType;
};

type StateRefType = {
  historyRoot: TinyState<Isolate | null>;
  appData: Record<string, any>;
};

const PersistedContext = createCascade<CTXType>((stateRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  invariant(stateRef.historyRoot);

  const [historyRootNode] = stateRef.historyRoot();

  const ctxRef = {} as CTXType;

  assign(ctxRef, {
    historyNode: historyRootNode,
    runtimeNode: null,
    runtimeRoot: null,
    stateRef,
  });

  return ctxRef;
});

export const Run = PersistedContext.run;

export function useXAppData<T = object>() {
  return useX().stateRef.appData as T;
}

export function createRef(
  setter: Record<string, any> | (() => Record<string, any>)
): StateRefType {
  return Object.freeze({
    historyRoot: tinyState.createTinyState<Isolate | null>(null),
    appData: optionalFunctionValue(setter),
  });
}

export function persist<T extends CB>(cb: T): T {
  const prev = PersistedContext.useX();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const ctxToUse = PersistedContext.use() ?? prev;
    return PersistedContext.run(ctxToUse.stateRef, () => cb(...args));
  }) as T;
}
export function useX<T = object>(): CTXType & T {
  return PersistedContext.useX() as CTXType & T;
}

export function useHistoryRoot() {
  return useX().stateRef.historyRoot();
}
export function useHistoryNode() {
  return useX().historyNode;
}
export function useSetHistory(history: Isolate) {
  const [, setHistoryRoot] = useHistoryRoot();
  setHistoryRoot(history);
}
export function useHistoryKey(key?: string | null): Isolate | null {
  if (isNullish(key)) {
    return null;
  }

  const historyNode = useX().historyNode;

  return historyNode?.keys[key] ?? null;
}
export function useIsolate() {
  return useX().runtimeNode ?? null;
}
export function useCurrentCursor() {
  return useIsolate()?.cursor() ?? 0;
}
export function useRuntimeRoot() {
  return useX().runtimeRoot;
}
export function useSetNextIsolateChild(child: Isolate): void {
  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  currentIsolate.addChild(child);
}
export function useSetIsolateKey(key: string | null, value: Isolate): void {
  if (!key) {
    return;
  }

  const currentIsolate = useIsolate();

  invariant(currentIsolate, ErrorStrings.NO_ACTIVE_ISOLATE);

  if (isNullish(currentIsolate.keys[key])) {
    currentIsolate.keys[key] = value;

    return;
  }

  deferThrow(text(ErrorStrings.ENCOUNTERED_THE_SAME_KEY_TWICE, { key }));
}
export function useAvailableRoot<I extends Isolate = Isolate>(): I | null {
  const root = useRuntimeRoot();

  if (root) {
    return root as I;
  }

  const [historyRoot] = useHistoryRoot();

  return historyRoot as I;
}
