import { Maybe } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { WithFieldName } from 'TestTypes';

export class SummaryFailure<F extends TFieldName, G extends TGroupName>
  implements WithFieldName<F>
{
  constructor(
    public fieldName: F,
    public message: Maybe<string>,
    public groupName: Maybe<G>
  ) {}

  static fromTestObject<F extends TFieldName, G extends TGroupName>(
    testObject: TIsolateTest<F, G>
  ) {
    return new SummaryFailure(
      testObject.fieldName,
      testObject.message,
      testObject.groupName
    );
  }
}
