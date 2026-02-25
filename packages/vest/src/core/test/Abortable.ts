import { TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

const abortSignalToTestRef = new WeakMap<AbortSignal, TIsolateTest>();

export function getAbortController(isolate: TIsolate): AbortController {
  if (isolate.abortController) {
    return isolate.abortController;
  }

  isolate.abortController = new AbortController();
  abortSignalToTestRef.set(
    isolate.abortController.signal,
    isolate as TIsolateTest,
  );

  return isolate.abortController;
}

export function getTestFromAbortSignal(
  signal: AbortSignal,
): TIsolateTest | undefined {
  return abortSignalToTestRef.get(signal);
}
