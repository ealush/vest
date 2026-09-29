import { CB, Nullable } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';

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
  public run!: {
    data: {
      raw: D | undefined;
      parsed: DraftSchemaOutput<S> | undefined;
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
};

export type GetFailuresResponse = FailureMessages | string[];

export type FailureMessages = Record<string, string[]>;
export type TSchema = any;

export type InferSchemaData<S> = S extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<S>
  : S extends { infer: infer T }
    ? { [K in keyof T]: T[K] } & NonNullable<unknown>
    : any;

export type InferSchemaOutput<S> = S extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<S>
  : S extends { infer: infer T }
    ? { [K in keyof T]: T[K] } & NonNullable<unknown>
    : any;

/**
 * Deep partial input for selective runs (`only()` / `focus()` /
 * `changed()`). Focused runs validate a region, so callers may omit
 * untouched fields at any depth — including incomplete nested objects and
 * partial array members, which selective nested validation supports at
 * runtime. Complete input stays assignable. Parser-established containers
 * (Date, Map, Set, …) and functions stay whole; plain objects and arrays
 * recurse. Tuple arity is not preserved (arrays of partial members);
 * runtime validation still enforces shape.
 */
export type DeepPartialInput<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? Array<DeepPartialInput<U>>
    : T extends
          | Date
          | RegExp
          | Error
          | Map<any, any>
          | ReadonlyMap<any, any>
          | Set<any>
          | ReadonlySet<any>
          | WeakMap<any, any>
          | WeakSet<any>
          | Promise<any>
          | ArrayBuffer
          | DataView
          | ArrayBufferView
      ? T
      : T extends object
        ? { [K in keyof T]?: DeepPartialInput<T[K]> }
        : T;

/**
 * Output from a selected region. Properties, tuple positions, and array
 * elements may be absent. Built-in values with identity semantics remain
 * whole. Presence and value must both be narrowed before consuming a draft.
 */
export type DeepDraft<T> = T extends (...args: any[]) => any
  ? T
  : T extends
        | Date
        | RegExp
        | Error
        | Map<any, any>
        | ReadonlyMap<any, any>
        | Set<any>
        | ReadonlySet<any>
        | WeakMap<any, any>
        | WeakSet<any>
        | Promise<any>
        | ArrayBuffer
        | DataView
        | ArrayBufferView
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepDraft<T[K]> }
      : T;

export type DraftSchemaOutput<S> = S extends undefined
  ? any
  : DeepDraft<InferSchemaOutput<S>>;

type SuiteResultData<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
  Output = InferSchemaOutput<S>,
> =
  | (Omit<SuiteSummary<F, G, D, S>, 'valid'> &
      SuiteSelectors<F, G> & {
        valid: true;
        value: Output;
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

/**
 * Any result whose execution scope may be focused, including latest-result
 * reads. Successful full runs use SuiteResult and certify complete output.
 */
export type FocusedSuiteResult<
  F extends string = TFieldName,
  G extends string = TGroupName,
  S extends TSchema = undefined,
  D = unknown,
> = SuiteResultData<
  BrandedFieldName<F>,
  BrandedGroupName<G>,
  S,
  D,
  DraftSchemaOutput<S>
> & {
  dump: CB<TIsolateSuite>;
  types: S extends undefined
    ? undefined
    : {
        input: DeepPartialInput<InferSchemaData<S>>;
        output: DraftSchemaOutput<S>;
      };
};

// Public-facing aliases remain plain strings; internals can still brand via FieldName/GroupName.
export type TFieldName = string;
export type TGroupName = string;
