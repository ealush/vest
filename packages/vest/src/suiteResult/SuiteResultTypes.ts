import { isFunction } from 'lodash';
import { hasOwnProperty, isArray, Maybe, Nullable } from 'vest-utils';

import { Severity } from 'Severity';
import { SummaryFailure } from 'SummaryFailure';
import { Done } from 'suiteRunResult';
import { SuiteSelectors } from 'suiteSelectors';

export class SummaryBase {
  public errorCount = 0;
  public warnCount = 0;
  public testCount = 0;
  public pendingCount = 0;
}

export class SuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
> extends SummaryBase {
  public [Severity.ERRORS]: SummaryFailure<F, G>[] = [];
  public [Severity.WARNINGS]: SummaryFailure<F, G>[] = [];
  public groups: Groups<G, F> = {} as Groups<G, F>;
  public tests: Tests<F> = {} as Tests<F>;
  public valid: Nullable<boolean> = null;

  // eslint-disable-next-line max-statements, complexity, max-lines-per-function
  static equals<F extends TFieldName, G extends TGroupName>(
    a: SuiteSummary<F, G>,
    b: SuiteSummary<F, G>,
  ): boolean {
    // cheap comparison
    if (
      !(
        a.errorCount === b.errorCount &&
        a.warnCount === b.warnCount &&
        a.testCount === b.testCount &&
        a.pendingCount === b.pendingCount &&
        a.valid === b.valid &&
        a[Severity.ERRORS].length === b[Severity.ERRORS].length &&
        a[Severity.WARNINGS].length === b[Severity.WARNINGS].length
      )
    ) {
      return false;
    }

    const queue = [[a, b]];

    while (queue.length) {
      const [a, b] = queue.shift() as [any, any];

      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      if (aKeys.length !== bKeys.length) {
        return false;
      }

      const merged = new Set([...aKeys, ...bKeys]);

      if (merged.size !== aKeys.length) {
        return false;
      }

      for (const key of aKeys) {
        if (key === 'VERSION') {
          continue;
        }

        if (!hasOwnProperty(b, key)) {
          return false;
        }

        if (isFunction(a[key])) {
          continue;
        }

        if (isArray(a[key]) || typeof a[key] === 'object') {
          queue.push([a[key], b[key]]);

          continue;
        }

        if (a[key] !== b[key]) {
          return false;
        }
      }
    }

    return true;
  }
}

export type TestsContainer<F extends TFieldName, G extends TGroupName> =
  | Group<G>
  | Tests<F>;
export type GroupTestSummary = SingleTestSummary;

export type Groups<G extends TGroupName, F extends TFieldName> = Record<
  G,
  Group<F>
>;
export type Group<F extends TFieldName> = Record<F, GroupTestSummary>;
export type Tests<F extends TFieldName> = Record<F, SingleTestSummary>;

export type SingleTestSummary = SummaryBase & {
  errors: string[];
  warnings: string[];
  valid: Nullable<boolean>;
  pendingCount: number;
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;

export type SuiteResult<
  F extends TFieldName,
  G extends TGroupName,
> = SuiteSummary<F, G> & SuiteSelectors<F, G> & { suiteName: SuiteName };

export type SuiteRunResult<
  F extends TFieldName,
  G extends TGroupName,
> = SuiteResult<F, G> & {
  done: Done<F, G>;
};

export type SuiteName = Maybe<string>;

export type TFieldName<T extends string = string> = T;
export type TGroupName<G extends string = string> = G;
