import { CB, Result } from 'vest-utils';
import { IsolateSerializer, IsolateKeys } from 'vestjs-runtime';

import { TestStatus } from '../core/StateMachines/IsolateTestStateMachine';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { Suite } from '../suite/SuiteTypes';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';

type Dumpable = {
  dump: CB<TIsolateSuite>;
};

export class SuiteSerializer {
  static serialize(suite: Dumpable) {
    const dump = { ...suite.dump() };

    return IsolateSerializer.serialize(dump, suiteSerializerReplacer);
  }

  static safeDeserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): Result<TIsolateSuite, Error> {
    return IsolateSerializer.safeDeserialize(serialized).map(
      isolate => isolate as TIsolateSuite,
    );
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): TIsolateSuite {
    return SuiteSerializer.safeDeserialize(serialized).unwrap();
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
  if (isStatusKey(key)) {
    return getAllowedStatus(value);
  }

  if (DisallowedKeys.has(key)) {
    return undefined;
  }

  return value;
}

function isStatusKey(key: string): boolean {
  return key === IsolateKeys.Status || key === 'testStatus';
}

function getAllowedStatus(value: any): any {
  return AllowedStatuses.has(value) ? value : undefined;
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
  'output',
  'severity',
  'tests',
]);
