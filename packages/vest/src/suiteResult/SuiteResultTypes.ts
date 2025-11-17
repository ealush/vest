import { CB, Nullable } from 'vest-utils';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { Severity } from './Severity';
import { SummaryFailure } from './SummaryFailure';
import { SuiteSelectors } from './selectors/suiteSelectors';

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
}

export type TestsContainer<F extends TFieldName, G extends TGroupName> =
  | Group<G>
  | Tests<F>;

export type Groups<G extends TGroupName, F extends TFieldName> = {
  [key in G]: Group<F>;
};
type Group<F extends TFieldName> = Record<F, SingleTestSummary> & ValidProperty;
export type Tests<F extends TFieldName> = Record<F, SingleTestSummary>;

export type SingleTestSummary = SummaryBase &
  CommonSummaryProperties &
  ValidProperty;

type ValidProperty = {
  valid: Nullable<boolean>;
};

export type CommonSummaryProperties = SummaryBase & {
  errors: string[];
  warnings: string[];
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;

export type SuiteResult<
  F extends TFieldName,
  G extends TGroupName,
> = SuiteSummary<F, G> & SuiteSelectors<F, G> & { dump: CB<TIsolateSuite> };

export type TFieldName<T extends string = string> = T;
export type TGroupName<G extends string = string> = G;
