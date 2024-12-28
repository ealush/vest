import { DoneCallback, useDoneCallbacks } from 'Runtime';

export function useDeferDoneCallback(doneCallback: DoneCallback): void {
  const [, setDoneCallbacks] = useDoneCallbacks();

  setDoneCallbacks(doneCallbacks => doneCallbacks.concat(doneCallback));
}
