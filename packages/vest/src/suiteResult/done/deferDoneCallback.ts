import { assign } from 'vest-utils';

import {
  DoneCallback,
  useDoneCallbacks,
  useFieldCallbacks,
} from 'PersistedContext';

export function deferDoneCallback(
  doneCallback: DoneCallback,
  fieldName?: string
): void {
  const [, setFieldCallbacks] = useFieldCallbacks();
  const [, setDoneCallbacks] = useDoneCallbacks();

  if (fieldName) {
    setFieldCallbacks(fieldCallbacks =>
      assign(fieldCallbacks, {
        [fieldName]: (fieldCallbacks[fieldName] || []).concat(doneCallback),
      })
    );

    return;
  }

  setDoneCallbacks(doneCallbacks => doneCallbacks.concat(doneCallback));
}
