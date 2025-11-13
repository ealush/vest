import { CB } from 'vest-utils';

import { TIsolateSuite } from 'IsolateSuite';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { Subscribe } from 'VestBus';
import { FieldExclusion } from 'focused';
import { TTypedMethods } from 'getTypedMethods';
import { SuiteSelectors } from 'suiteSelectors';

// Import schema-related types from n4s
import type { RuleInstance } from 'n4s';

// Helper type to extract data type from schema
export type InferSchemaData<S> = S extends RuleInstance<infer D, any>
  ? D
  : any;

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends RuleInstance<any> | undefined = undefined,
> = SuiteMethods<F, G, T, S>;

type SuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends RuleInstance<any> | undefined,
> = {
  dump: CB<TIsolateSuite>;

  get: CB<SuiteResult<F, G, S>>;
  resume: CB<void, [TIsolateSuite]>;
  reset: CB<void>;
  remove: CB<void, [fieldName: F]>;
  resetField: CB<void, [fieldName: F]>;
  run: (...args: Parameters<T>) => SuiteResult<F, G, S>;
  runStatic: (...args: Parameters<T>) => SuiteResult<F, G, S>;
  subscribe: Subscribe;
} & AfterMethods<F, G, T, S> &
  TTypedMethods<F, G> &
  SuiteSelectors<F, G>;

type AfterMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends RuleInstance<any> | undefined,
> = {
  after: CB<AfterMethods<F, G, T, S>, [callback: CB]>;
  afterField: CB<AfterMethods<F, G, T, S>, [fieldName: F, callback: CB]>;
  focus: CB<AfterMethods<F, G, T, S>, [config: SuiteModifiers<F>]>;
  run: (...args: Parameters<T>) => SuiteResult<F, G, S>;
};

export type SuiteModifiers<F extends TFieldName> = {
  only?: FieldExclusion<F>;
};
