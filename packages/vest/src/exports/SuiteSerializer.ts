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
