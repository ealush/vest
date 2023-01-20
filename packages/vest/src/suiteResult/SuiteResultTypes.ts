import { Done } from 'suiteRunResult';
import { SuiteSelectors } from 'suiteSelectors';

export type SuiteSummary<F extends TFieldName> = {
  groups: Groups;
  tests: Tests<F>;
  valid: boolean;
} & SummaryBase;

export type TestsContainer<F extends TFieldName> = Group | Tests<F>;
export type GroupTestSummary = SingleTestSummary;

export type Groups = Record<string, Group>;
export type Group = Record<string, GroupTestSummary>;
export type Tests<F extends TFieldName> = Record<F, SingleTestSummary>;

export type SingleTestSummary = SummaryBase & {
  errors: string[];
  warnings: string[];
  valid: boolean;
};

type SummaryBase = {
  errorCount: number;
  warnCount: number;
  testCount: number;
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;

export type SuiteResult<F extends TFieldName> = SuiteSummary<F> &
  SuiteSelectors<F> & { suiteName: SuiteName };

export type SuiteRunResult<F extends TFieldName> = SuiteResult<F> & {
  done: Done<F>;
};

export type SuiteName = string | undefined;

export type TFieldName<T extends string = string> = T;
