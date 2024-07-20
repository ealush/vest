import { Predicate, Predicates, isEmpty, isNullish } from 'vest-utils';
import { TIsolate, VestRuntime, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { PreAggCache, usePreAggCache } from 'Runtime';
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

    const allPending = SuiteWalker.usePreAggs().pending;

    if (isEmpty(allPending)) {
      return false;
    }

    return allPending.some(Predicates.all(predicate ?? true));
  }

  static usePreAggs() {
    return usePreAggCache(buildPreAggCache);
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

function buildPreAggCache(): PreAggCache {
  const root = SuiteWalker.defaultRoot();

  const base: PreAggCache = {
    pending: [],
    failures: {
      errors: {},
      warnings: {},
    },
  };

  if (!root) {
    return base;
  }

  return Walker.reduce(
    root,
    // eslint-disable-next-line complexity, max-statements
    (agg, isolate: TIsolate) => {
      if (VestIsolate.isPending(isolate)) {
        agg.pending.push(isolate);
      }

      if (VestTest.is(isolate)) {
        const fieldName = VestTest.getData(isolate).fieldName;

        if (VestTest.isWarning(isolate)) {
          agg.failures.warnings[fieldName] =
            agg.failures.warnings[fieldName] ?? [];
          agg.failures.warnings[fieldName].push(isolate);
        }

        if (VestTest.isFailing(isolate)) {
          agg.failures.errors[fieldName] = agg.failures.errors[fieldName] ?? [];
          agg.failures.errors[fieldName].push(isolate);
        }
      }

      return agg;
    },
    base,
  );
}
