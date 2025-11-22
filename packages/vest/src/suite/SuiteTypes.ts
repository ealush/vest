import { CB } from 'vest-utils';

import { Subscribe } from '../core/VestBus/VestBus';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { FieldExclusion } from '../hooks/focused/focused';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
  InferSchemaData,
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { SuiteSelectors } from '../suiteResult/selectors/suiteSelectors';

import { TTypedMethods } from './getTypedMethods';
import { StandardSchemaV1 } from './standardSchemaSpec';

export type SuiteCallback<Data = any, T extends CB = CB> = T extends (
  ...args: infer Args
) => infer Return
  ? Args extends [any, ...infer Rest]
    ? (data: Data, ...rest: Rest) => Return
    : (...args: Args) => Return
  : T;

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
> = SuiteMethods<F, G, T, S> &
  StandardSchemaV1<InferSchemaData<S>, InferSchemaData<S>>;

type SuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends TSchema,
> = {
  dump: CB<TIsolateSuite>;

  get: CB<SuiteResult<F, G, S>>;
  resume: CB<void, [TIsolateSuite]>;
  reset: CB<void>;
  remove: CB<void, [fieldName: F]>;
  resetField: CB<void, [fieldName: F]>;
  run: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  runStatic: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  validate: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  subscribe: Subscribe;
} & AfterMethods<F, G, T, S> &
  TTypedMethods<F, G> &
  SuiteSelectors<F, G>;

type AfterMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends TSchema,
> = {
  after: CB<AfterMethods<F, G, T, S>, [callback: CB]>;
  afterField: CB<AfterMethods<F, G, T, S>, [fieldName: F, callback: CB]>;
  focus: CB<AfterMethods<F, G, T, S>, [config: SuiteModifiers<F>]>;
  run: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
};

export type SuiteModifiers<F extends TFieldName> = {
  only?: FieldExclusion<F>;
};
