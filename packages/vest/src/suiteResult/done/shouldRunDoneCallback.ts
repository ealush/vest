import { TestWalker } from 'SuiteWalker';

// TODO: This check also happens when tests are finished. Need to combine them.
export function shouldRunDoneCallback(fieldName?: string): boolean {
  // is suite finished || field name exists, and tests are finished;

  return !!(
    !TestWalker.hasRemainingTests() ||
    (fieldName && !TestWalker.hasRemainingTests(fieldName))
  );
}
