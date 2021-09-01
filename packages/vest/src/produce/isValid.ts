import { isNotEmpty, isEmpty } from 'isEmpty';

import type { TDraftResult } from 'produceDraft';
import {
  useTestObjects,
  isOptionalField,
  usePending,
  useLagging,
} from 'stateHooks';

export function isValid(result: TDraftResult): boolean {
  if (result.hasErrors()) {
    return false;
  }

  const [testObjects] = useTestObjects();

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
  const testObjectsPerField = countTestObjectsPerField();

  for (const test in result.tests) {
    if (
      !isOptionalField(test) &&
      result.tests[test].testCount !== testObjectsPerField[test]
    ) {
      return false;
    }
  }

  return true;
}

function countTestObjectsPerField(): Record<string, number> {
  const [testObjects] = useTestObjects();

  return testObjects.reduce((counters, testObject) => {
    counters[testObject.fieldName] = (counters[testObject.fieldName] || 0) + 1;
    return counters;
  }, {});
}
