import { TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

const TEST_REF = Symbol('vest_test_ref');

type AbortSignalWithTestRef = AbortSignal & {
  [TEST_REF]?: TIsolateTest;
};

export function getAbortController(isolate: TIsolate): AbortController {
  if (isolate.abortController) {
    return isolate.abortController;
  }

  isolate.abortController = new AbortController();

  (isolate.abortController.signal as AbortSignalWithTestRef)[TEST_REF] =
    isolate as TIsolateTest;

  return isolate.abortController;
}

export function getTestFromAbortSignal(
  signal?: AbortSignal,
): TIsolateTest | undefined {
  return (signal as AbortSignalWithTestRef | undefined)?.[TEST_REF];
}
