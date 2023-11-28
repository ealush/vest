import { Predicate, Predicates, isNullish } from 'vest-utils';
import { VestRuntime, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { VestIsolate } from 'VestIsolate';
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
      Predicates.all(VestIsolate.isPending, predicate ?? true)
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
