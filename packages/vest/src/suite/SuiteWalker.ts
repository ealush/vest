import { Predicates, type Predicate } from 'vest-utils';
import { TIsolate, VestRuntime, Walker } from 'vestjs-runtime';

import { CommonStates } from 'CommonStateMachine';
import { TIsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import { matchesOrHasNoFieldName } from 'matchingFieldName';

export class SuiteWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static hasPending(predicate?: Predicate): boolean {
    const root = SuiteWalker.defaultRoot();

    if (!root) {
      return false;
    }

    return Walker.some(root, (isolate: TIsolate) => {
      return (
        (isolate.status === CommonStates.PENDING && predicate?.(isolate)) ??
        true
      );
    });
  }

  static hasRemainingTests(fieldName?: TFieldName): boolean {
    return SuiteWalker.hasPending(
      Predicates.all(VestTest.is, (testObject: TIsolateTest) => {
        return matchesOrHasNoFieldName(VestTest.getData(testObject), fieldName);
      })
    );
  }
}
