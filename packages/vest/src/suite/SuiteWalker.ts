import { Predicate, Predicates, isNullish } from 'vest-utils';
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

    return Walker.some(
      root,
      Predicates.all(isPendingStatus, predicate ?? true)
    );
  }

  // Checks whether there are pending isolates in the tree.
  // If a fieldname is provided, will only check tests with a matching fieldname.
  static hasRemainingWithTestNameMatching(fieldName?: TFieldName): boolean {
    return SuiteWalker.hasPending(
      Predicates.any(
        isNullish(fieldName),
        Predicates.all(VestTest.is, (testObject: TIsolateTest) => {
          return matchesOrHasNoFieldName(
            VestTest.getData(testObject),
            fieldName
          );
        })
      )
    );
  }
}

function isPendingStatus(isolate: TIsolate) {
  return isolate.status === CommonStates.PENDING;
}
