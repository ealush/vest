import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { WithFieldName } from '../core/test/TestTypes';

import { TFieldName, TGroupName } from './SuiteResultTypes';

export class SummaryFailure<F extends TFieldName, G extends TGroupName>
  implements WithFieldName<F>
{
  constructor(
    public fieldName: F,
    public message: string | undefined,
    public groupName: G | undefined,
  ) {}

  static fromTestObject<F extends TFieldName, G extends TGroupName>(
    testObject: TIsolateTest<F>,
  ): SummaryFailure<F, G> {
    const { fieldName, message } = VestTest.getData(testObject);
    const groupName = VestTest.getGroupName<G>(testObject);

    return new SummaryFailure<F, G>(fieldName, message, groupName);
  }
}
