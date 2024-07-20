import { Predicate, Predicates, isNullish } from 'vest-utils';
import { TIsolate, VestRuntime, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { usePendingCache } from 'Runtime';
import { TFieldName } from 'SuiteResultTypes';
import { VestIsolate } from 'VestIsolate';
import { VestTest } from 'VestTest';
import { matchesOrHasNoFieldName } from 'matchingFieldName';

export class SuiteWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static useHasPending(predicate?: Predicate): boolean {
    const root = SuiteWalker.defaultRoot();

    if (!root) {
      return false;
    }

    const allPending = usePendingCache(this.findAllPending);

    if (!allPending.length) {
      return false;
    }

    return allPending.some(Predicates.all(predicate ?? true));
  }

  static findAllPending(): TIsolate[] {
    const root = SuiteWalker.defaultRoot();

    if (!root) {
      return [];
    }

    return Walker.findAll(root, VestIsolate.isPending);
  }

  // Checks whether there are pending isolates in the tree.
  // If a fieldname is provided, will only check tests with a matching fieldname.
  static useHasRemainingWithTestNameMatching(fieldName?: TFieldName): boolean {
    return SuiteWalker.useHasPending(
      Predicates.any(
        isNullish(fieldName),
        Predicates.all(VestTest.is, (testObject: TIsolateTest) => {
          return matchesOrHasNoFieldName(
            VestTest.getData(testObject),
            fieldName,
          );
        }),
      ),
    );
  }
}
