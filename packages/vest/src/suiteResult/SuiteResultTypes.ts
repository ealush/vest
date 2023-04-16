import { Done } from 'suiteRunResult';
import { SuiteSelectors } from 'suiteSelectors';

export type SuiteSummary<F extends TFieldName, G extends TGroupName> = {
  errors: SummaryFailure<F, G>[];
  warnings: SummaryFailure<F, G>[];
  groups: Groups<G, F>;
  tests: Tests<F>;
  valid: boolean;
} & SummaryBase;

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

export type SummaryFailure<F extends TFieldName, G extends TGroupName> = {
  fieldName: F;
  groupName: G | undefined;
  message: string | undefined;
};

type SummaryBase = {
  errorCount: number;
  warnCount: number;
  testCount: number;
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

export type SuiteName = string | undefined;

export type TFieldName<T extends string = string> = T;
export type TGroupName<G extends string = string> = G;
