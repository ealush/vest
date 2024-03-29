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
    public groupName: G | undefined
  ) {}

  static fromTestObject<F extends TFieldName, G extends TGroupName>(
    testObject: TIsolateTest<F, G>
  ) {
    const { fieldName, message, groupName } = VestTest.getData(testObject);

    return new SummaryFailure(fieldName, message, groupName);
  }
}
