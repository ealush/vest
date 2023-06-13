import { Maybe } from 'vest-utils';

import { Severity } from 'Severity';
import { SummaryFailure } from 'SummaryFailure';
import { Done } from 'suiteRunResult';
import { SuiteSelectors } from 'suiteSelectors';

export class SummaryBase {
  public errorCount = 0;
  public warnCount = 0;
  public testCount = 0;
}

export class SuiteSummary<
  F extends TFieldName,
  G extends TGroupName
> extends SummaryBase {
  public [Severity.ERRORS]: SummaryFailure<F, G>[] = [];
  public [Severity.WARNINGS]: SummaryFailure<F, G>[] = [];
  public groups: Groups<G, F> = {} as Groups<G, F>;
  public tests: Tests<F> = {} as Tests<F>;
  public valid = false;
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
  valid: boolean;
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;

export type SuiteResult<
  F extends TFieldName,
  G extends TGroupName
> = SuiteSummary<F, G> & SuiteSelectors<F, G> & { suiteName: SuiteName };

export type SuiteRunResult<
  F extends TFieldName,
  G extends TGroupName
> = SuiteResult<F, G> & {
  done: Done<F, G>;
};

export type SuiteName = Maybe<string>;

export type TFieldName<T extends string = string> = T;
export type TGroupName<G extends string = string> = G;
