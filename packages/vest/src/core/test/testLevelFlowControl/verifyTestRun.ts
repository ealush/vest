import { isOptionalFiedApplied } from 'optional';

import { IsolateTest } from 'IsolateTest';
import { isExcluded } from 'exclusive';
import { shouldSkipBasedOnMode } from 'mode';
import { withinActiveOmitWhen } from 'omitWhen';
import { isExcludedIndividually } from 'skipWhen';

export function verifyTestRun(testObject: IsolateTest): IsolateTest {
  if (shouldSkipBasedOnMode(testObject)) {
    testObject.skip();

    return testObject;
  }

  if (withinActiveOmitWhen() || isOptionalFiedApplied(testObject.fieldName)) {
    testObject.omit();

    return testObject;
  }

  if (isExcluded(testObject)) {
    // We're forcing skipping the pending test
    // if we're directly within a skipWhen block
    // This mostly means that we're probably giving
    // up on this async test intentionally.
    testObject.skip(isExcludedIndividually());
    return testObject;
  }

  return testObject;
}
