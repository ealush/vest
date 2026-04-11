import { CB, Nullable } from 'vest-utils';

import { Severity } from './Severity';
import { SummaryFailure } from './SummaryFailure';
import { SuiteSelectors } from './selectors/suiteSelectors';
import { SuiteModifiers } from '../suite/SuiteTypes';

export class SummaryBase {
  public errorCount = 0;
  public warnCount = 0;
  public testCount = 0;
  public pendingCount = 0;
}

export class SuiteSummary<
  F extends TFieldName,
  G extends TGroupName,
  D = unknown,
  S extends TSchema = undefined,
> extends SummaryBase {
  public [Severity.ERRORS]: SummaryFailure<F, G>[] = [];
  public [Severity.WARNINGS]: SummaryFailure<F, G>[] = [];
  public groups: Groups<G, F> = {} as Groups<G, F>;
  public tests: Tests<F> = {} as Tests<F>;
  public dependencies!: Record<string, string[]>;
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

    Object.defineProperty(this, 'dependencies', {
      configurable: true,
      enumerable: false,
      value: {},
      writable: true,
    });

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
        value?: undefined;
        issues: any;
      })
  | (Omit<SuiteSummary<F, G, D, S>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: null;
        value?: undefined;
        issues?: any;
      });

export type SuiteResult<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
> = SuiteResultData<F, G, S, D> & {
  dump: () => any;
  types: {
    fields: F;
    groups: G;
    data: D;
    schema: S;
  };
};

export type TFieldName = string & { __brand: 'TFieldName' };
export type TGroupName = string & { __brand: 'TGroupName' };
