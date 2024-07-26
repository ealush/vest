import { CB } from 'vest-utils';

import { StaticSuiteRunResult } from './createSuite';
import { TTypedMethods } from './getTypedMethods';

import { TIsolateSuite } from '@/core/isolate/IsolateSuite/IsolateSuite';
import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from '@/suiteResult/SuiteResultTypes';
import { SuiteSelectors } from '@/suiteResult/selectors/suiteSelectors';

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
> = ((...args: Parameters<T>) => SuiteRunResult<F, G>) & SuiteMethods<F, G, T>;

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
  runStatic: CB<StaticSuiteRunResult<F, G>, Parameters<T>>;
  subscribe: (cb: CB) => CB<void>;
} & TTypedMethods<F, G> &
  SuiteSelectors<F, G>;
