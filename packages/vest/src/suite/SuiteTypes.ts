import { CB } from 'vest-utils';

import { TIsolateSuite } from 'IsolateSuite';
import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { TTypedMethods } from 'getTypedMethods';
import { SuiteSelectors } from 'suiteSelectors';

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB
> = ((...args: Parameters<T>) => SuiteRunResult<F, G>) & SuiteMethods<F, G>;

export type SuiteMethods<F extends TFieldName, G extends TGroupName> = {
  dump: CB<TIsolateSuite>;
  get: CB<SuiteResult<F, G>>;
  resume: CB<void, [TIsolateSuite]>;
  reset: CB<void>;
  remove: CB<void, [fieldName: F]>;
  resetField: CB<void, [fieldName: F]>;
  subscribe: (cb: CB) => CB<void>;
} & TTypedMethods<F, G> &
  SuiteSelectors<F, G>;
