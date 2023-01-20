import { assign } from 'vest-utils';

import { TFieldName } from '../SuiteResultTypes';

import {
  DoneCallback,
  useDoneCallbacks,
  useFieldCallbacks,
} from 'PersistedContext';

export function deferDoneCallback(
  doneCallback: DoneCallback,
  fieldName?: TFieldName
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
