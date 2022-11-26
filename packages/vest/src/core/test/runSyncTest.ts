import VestTest, { TestResult } from 'VestTest';

import context from 'ctx';
/**
 * Runs sync tests - or extracts promise.
 */
export default function runSyncTest(testObject: VestTest): TestResult {
  return context.run({ currentTest: testObject }, () => testObject.run());
}
