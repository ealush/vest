import { IsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { WithFieldName } from 'TestTypes';

export class SummaryFailure<F extends TFieldName, G extends TGroupName>
  implements WithFieldName<F>
{
  constructor(
    public fieldName: F,
    public message: string | undefined,
    public groupName: G | undefined
  ) {}

  static fromTestObject<F extends TFieldName, G extends TGroupName>(
    testObject: IsolateTest<F, G>
  ) {
    return new SummaryFailure(
      testObject.fieldName,
      testObject.message,
      testObject.groupName
    );
  }
}
