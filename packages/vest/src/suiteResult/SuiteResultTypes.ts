import { CB, Nullable } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';

import { Severity } from './Severity';
import { SummaryItem } from './SummaryItem';
import { SuiteSelectors } from './selectors/suiteSelectors';
import { SuiteModifiers } from '../suite/SuiteTypes';

export class SummaryBase {
  public errorCount = 0;
  public warnCount = 0;
  public testCount = 0;
  public pendingCount = 0;
  public successCount = 0;
}

export class SuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
  D = unknown,
  S extends TSchema = undefined,
> extends SummaryBase {
  public [Severity.ERRORS]: SummaryItem<F, G>[] = [];
  public [Severity.WARNINGS]: SummaryItem<F, G>[] = [];
  public [Severity.SUCCESS]: SummaryItem<F, G>[] = [];
  public groups: Groups<G, F> = {} as Groups<G, F>;
  public tests: Tests<F> = {} as Tests<F>;
  public run!: {
    data: {
      raw: D | undefined;
      parsed: Partial<InferSchemaOutput<S>> | undefined;
    };
    time: Date;
    focus?: SuiteModifiers<F, G>;
  };
  public valid: Nullable<boolean> = null;

  constructor() {
    super();

    Object.defineProperty(this, 'run', {
      configurable: true,
      enumerable: false,
      value: {
        data: {
          raw: undefined,
          parsed: undefined,
        },
        time: new Date(0),
      },
      writable: true,
    });
  }
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
  success: string[];
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;
export type TSchema = any;

export type InferSchemaData<S> = S extends {
  '~standard': { types: { input: infer I } };
}
  ? I
  : S extends { infer: infer T }
    ? { [K in keyof T]: T[K] } & NonNullable<unknown>
    : any;

export type InferSchemaOutput<S> = S extends {
  '~standard': { types: { output: infer O } };
}
  ? O
  : S extends { infer: infer T }
    ? { [K in keyof T]: T[K] } & NonNullable<unknown>
    : any;

type SuiteResultData<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
> =
  | (Omit<SuiteSummary<F, G, D, S>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: true;
        value: InferSchemaOutput<S>;
        issues?: undefined;
      })
  | (Omit<SuiteSummary<F, G, D, S>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: false;
        issues: ReadonlyArray<StandardSchemaV1.Issue>;
        value?: undefined;
      })
  | (Omit<SuiteSummary<F, G, D, S>, 'valid'> &
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
  D = unknown,
> = SuiteResultData<BrandedFieldName<F>, BrandedGroupName<G>, S, D> & {
  dump: CB<TIsolateSuite>;
  types: S extends undefined
    ? undefined
    : { input: InferSchemaData<S>; output: InferSchemaOutput<S> };
};

// Public-facing aliases remain plain strings; internals can still brand via FieldName/GroupName.
export type TFieldName = string;
export type TGroupName = string;
