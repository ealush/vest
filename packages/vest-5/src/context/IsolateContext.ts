import { Isolate } from 'IsolateTypes';
import { createCascade } from 'context';
import { deferThrow, invariant, isNullish } from 'vest-utils';

import { createIsolate } from 'createIsolate';

export const IsolateContext = createCascade<CTXType>(
  (ctxRef, parentContext) => {
    if (parentContext) {
      return null;
    }

    const suiteRuntimeRoot = ctxRef?.suiteRuntimeRoot ?? createIsolate();

    return {
      suiteRuntimeRoot,
      isolate: suiteRuntimeRoot,
    };
  }
);

type CTXType = {
  isolate: Isolate;
  suiteRuntimeRoot: Isolate;
};

export function useIsolateSoft() {
  return IsolateContext.use()?.isolate ?? null;
}

export function useIsolate() {
  return IsolateContext.useX().isolate ?? null;
}

export function useSuiteRuntimeRootSoft() {
  return IsolateContext.use()?.suiteRuntimeRoot;
}

export function useSuiteRuntimeRoot() {
  return IsolateContext.useX().suiteRuntimeRoot;
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
