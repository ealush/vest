import { CB } from 'vest-utils';

import { TIsolateSuite } from 'IsolateSuite';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { Subscribe } from 'VestBus';
import { TTypedMethods } from 'getTypedMethods';
import { SuiteSelectors } from 'suiteSelectors';

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
> = SuiteMethods<F, G, T>;

export type SuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
> = {
  dump: CB<TIsolateSuite>;
  get: CB<SuiteResult<F, G>>;
  resume: CB<void, [TIsolateSuite]>;
  reset: CB<void>;
  remove: CB<void, [fieldName: F]>;
  resetField: CB<void, [fieldName: F]>;
  run: (...args: Parameters<T>) => SuiteResult<F, G>;
  subscribe: Subscribe;
} & AfterMethods<F, G, T> &
  TTypedMethods<F, G> &
  SuiteSelectors<F, G>;

export type AfterMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
> = {
  after: CB<AfterMethods<F, G, T>, [callback: CB]>;
  afterField: CB<AfterMethods<F, G, T>, [fieldName: F, callback: CB]>;
  run: (...args: Parameters<T>) => SuiteResult<F, G>;
};
