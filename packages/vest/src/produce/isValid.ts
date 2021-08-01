import { isNotEmpty, isEmpty } from 'isEmpty';

import type { TDraftResult } from 'produceDraft';
import {
  useTestsOrdered,
  useOptionalFields,
  usePending,
  useLagging,
} from 'stateHooks';

export function isValid(result: TDraftResult): boolean {
  if (result.hasErrors()) {
    return false;
  }

  const [testObjects] = useTestsOrdered();

  if (isEmpty(testObjects)) {
    return false;
  }

  const [pending] = usePending();
  const [lagging] = useLagging();

  if (
    isNotEmpty(
      pending.concat(lagging).filter(testObject => !testObject.isWarning)
    )
  ) {
    return false;
  }

  return noMissingRequiredTestRuns(result);
}

function noMissingRequiredTestRuns(result: TDraftResult): boolean {
  const [optionalFields] = useOptionalFields();

  for (const test in result.tests) {
    if (!optionalFields[test] && result.tests[test].testCount === 0) {
      return false;
    }
  }

  return true;
}
