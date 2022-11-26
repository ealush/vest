import { SuiteSelectors } from 'suiteSelectors';

export type SuiteSummary = {
  groups: Groups;
  tests: Tests;
  valid: boolean;
} & SummaryBase;

export type TestsContainer = Group | Tests;
export type GroupTestSummary = SingleTestSummary;

export type Groups = Record<string, Group>;
export type Group = Record<string, GroupTestSummary>;
export type Tests = Record<string, SingleTestSummary>;

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

export type SuiteResult = SuiteSummary & SuiteSelectors;

export type SuiteRunResult = SuiteResult & { done: Done };

export interface Done {
  (...args: [cb: (res: SuiteResult) => void]): SuiteRunResult;
  (
    ...args: [fieldName: string, cb: (res: SuiteResult) => void]
  ): SuiteRunResult;
}
