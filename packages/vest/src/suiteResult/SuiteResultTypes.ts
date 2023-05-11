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
  public tests: Tests<F, G> = {} as Tests<F, G>;
  public valid = false;
}

export type TestsContainer<F extends TFieldName, G extends TGroupName> =
  | Group<F, G>
  | Tests<F, G>;
export type GroupTestSummary<
  F extends TFieldName,
  G extends TGroupName
> = SingleTestSummary<F, G>;

export type Groups<G extends TGroupName, F extends TFieldName> = Record<
  G,
  Group<F, G>
>;
export type Group<F extends TFieldName, G extends TGroupName> = Record<
  F,
  GroupTestSummary<F, G>
>;
export type Tests<F extends TFieldName, G extends TGroupName> = Record<
  F,
  SingleTestSummary<F, G>
>;

export type SingleTestSummary<
  F extends TFieldName,
  G extends TGroupName
> = SummaryBase & {
  errors: SummaryFailure<F, G>[];
  warnings: SummaryFailure<F, G>[];
  valid: boolean;
};

export type GetFailuresResponse<F extends TFieldName, G extends TGroupName> =
  | FailureMessages<F, G>
  | SummaryFailure<F, G>[];

export type FailureMessages<
  F extends TFieldName,
  G extends TGroupName
> = Record<string, SummaryFailure<F, G>[]>;

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

export type SuiteName = string | undefined;

export type TFieldName<T extends string = string> = T;
export type TGroupName<G extends string = string> = G;
