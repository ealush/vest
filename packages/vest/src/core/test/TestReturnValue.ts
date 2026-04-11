import { TFieldName } from '../../suiteResult/SuiteResultTypes';
import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

export type TestReturnValue = TIsolateTest & {
  /**
   * Declares that this test depends on the given fields.
   * When any dependency field is focused (via suite.only()),
   * this test's field is auto-included.
   */
  dependsOn(...fields: (TFieldName | string)[]): TestReturnValue;
};
