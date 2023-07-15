import { Maybe } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { WithFieldName } from 'TestTypes';
import { VestTestInspector } from 'VestTestInspector';

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
    const { fieldName, message, groupName } = VestTestInspector.getData<F, G>(
      testObject
    );

    return new SummaryFailure(fieldName, message, groupName);
  }
}
