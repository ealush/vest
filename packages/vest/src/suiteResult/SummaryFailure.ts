import { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { WithFieldName } from 'TestTypes';
import { VestTest } from 'VestTest';

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
