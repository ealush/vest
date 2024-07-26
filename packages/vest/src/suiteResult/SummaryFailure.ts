import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { TFieldName, TGroupName } from '@/suiteResult/SuiteResultTypes';
import { WithFieldName } from '@/core/test/TestTypes';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';

export class SummaryFailure<F extends TFieldName, G extends TGroupName>
  implements WithFieldName<F>
{
  constructor(
    public fieldName: F,
    public message: string | undefined,
    public groupName: G | undefined,
  ) {}

  static fromTestObject<F extends TFieldName, G extends TGroupName>(
    testObject: TIsolateTest<F, G>,
  ) {
    const { fieldName, message, groupName } = VestTest.getData(testObject);

    return new SummaryFailure(fieldName, message, groupName);
  }
}
