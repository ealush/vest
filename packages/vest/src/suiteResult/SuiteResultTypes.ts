import { CB, Nullable } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

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

export type TestsContainer<F extends TFieldName, _G extends TGroupName> =
  | Group<F>
  | Tests<F>;

export type Groups<G extends TGroupName, F extends TFieldName> = {
  [key in G]: Group<F>;
};
type Group<F extends TFieldName> = {
  [key in F]: SingleTestSummary;
} & ValidProperty;
export type Tests<F extends TFieldName> = { [key in F]: SingleTestSummary };

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
export type TSchema = any;

export type InferSchemaData<S> = S extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<S>
  : S extends { infer: infer T }
    ? { [K in keyof T]: T[K] } & NonNullable<unknown>
    : any;

type SuiteResultData<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
> =
  | (Omit<SuiteSummary<F, G>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: true;
        value: InferSchemaData<S>;
        issues?: undefined;
      })
  | (Omit<SuiteSummary<F, G>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: false;
        issues: ReadonlyArray<StandardSchemaV1.Issue>;
        value?: undefined;
      })
  | (Omit<SuiteSummary<F, G>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: null;
        issues?: undefined;
        value?: undefined;
      });

type BrandedFieldName<F extends string> = F & TFieldName;
type BrandedGroupName<G extends string> = G & TGroupName;

export type SuiteResult<
  F extends string = TFieldName,
  G extends string = TGroupName,
  S extends TSchema = undefined,
> = SuiteResultData<BrandedFieldName<F>, BrandedGroupName<G>, S> & {
  dump: CB<TIsolateSuite>;
  types: S extends undefined
    ? undefined
    : { input: InferSchemaData<S>; output: InferSchemaData<S> };
};

// Public-facing aliases remain plain strings; internals can still brand via FieldName/GroupName.
export type TFieldName = string;
export type TGroupName = string;
