import { Predicate, Predicates, isFunction, isNullish } from 'vest-utils';
import { VestRuntime, Walker, TIsolate } from 'vestjs-runtime';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { matchesOrHasNoFieldName } from '../core/test/helpers/matchingFieldName';
import { TFieldName } from '../suiteResult/SuiteResultTypes';

export class SuiteWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static useHasPending(predicate?: Predicate): boolean {
    const root = SuiteWalker.defaultRoot();

    if (!root) {
      return false;
    }

    return Walker.some(root, (node: TIsolate) => {
      if (!VestTest.is(node)) {
        return false;
      }
      return (
        VestTest.isPending(node) &&
        (isFunction(predicate) ? predicate(node) : (predicate ?? true))
      );
    });
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
        Predicates.all(VestTest.is, (testObject: TIsolate) => {
          return matchesOrHasNoFieldName(
            VestTest.getData(testObject as TIsolateTest),
            fieldName,
          ).unwrap();
        }),
      ),
    );
  }
}
