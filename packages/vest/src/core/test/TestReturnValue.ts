import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';

export interface TestReturnValue<F extends TFieldName = TFieldName> extends TIsolateTest<F> {
  /**
   * Declares that this test depends on the given fields.
   * When any dependency field is focused (via suite.only()),
   * this test's field is auto-included (if it has been tested before).
   *
   * Additionally, this field will be considered invalid if any of its
   * dependencies are invalid.
   */
  dependsOn(...fields: F[]): TestReturnValue<F>;
}
