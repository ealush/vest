import { CB } from 'vest-utils';
import { IsolateSerializer, IsolateKeys } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { TestStatus } from 'IsolateTestStateMachine';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';

type Dumpable = {
  dump: CB<TIsolateSuite>;
};

export class SuiteSerializer {
  static serialize(suite: Dumpable) {
    const dump = { ...suite.dump() };

    return IsolateSerializer.serialize(dump, suiteSerializerReplacer);
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): TIsolateSuite {
    return IsolateSerializer.deserialize(serialized) as TIsolateSuite;
  }

  static resume(
    suite: Suite<TFieldName, TGroupName>,
    root: string | TIsolateSuite | Record<string, any>,
  ): void {
    const suiteRoot = SuiteSerializer.deserialize(root);

    suite.resume(suiteRoot);
  }
}

function suiteSerializerReplacer(value: any, key: string) {
  if (key === 'output') {
    return undefined;
  }

  if (key === IsolateKeys.Status) {
    if (AllowedStatuses.has(value)) {
      return value;
    }

    return undefined;
  }

  if (DisallowedKeys.has(key)) {
    return undefined;
  }

  return value;
}

const AllowedStatuses = new Set([
  TestStatus.FAILED,
  TestStatus.PASSING,
  TestStatus.WARNING,
]);

const DisallowedKeys = new Set([
  'focusMode',
  'match',
  'matchAll',
  'severity',
  'tests',
]);
