import { Predicate, Predicates, isEmpty, isNullish } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { TFieldName } from '../suiteResult/SuiteResultTypes';
import { isVestIsolate } from '../core/isolate/VestIsolateType';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { matchesOrHasNoFieldName } from '../core/test/helpers/matchingFieldName';

export class SuiteWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static useHasPending(predicate?: Predicate): boolean {
    const root = SuiteWalker.defaultRoot();

    if (!isVestIsolate(root)) {
      return false;
    }

    const allPending = root.data.tests.filter(VestTest.isPending);

    if (isEmpty(allPending)) {
      return false;
    }

    return allPending.some(Predicates.all(predicate ?? true));
  }

  static useResolve() {
    const root = SuiteWalker.defaultRoot() as TIsolateSuite;

    if (!root) {
      return;
    }

    root.data.resolver();
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
