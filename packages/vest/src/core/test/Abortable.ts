import { TIsolate } from 'vestjs-runtime';

export function getAbortController(isolate: TIsolate): AbortController {
  if (isolate.abortController) {
    return isolate.abortController;
  }
  isolate.abortController = new AbortController();
  return isolate.abortController;
}
