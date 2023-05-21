import { CB, assign } from 'vest-utils';

import { SuiteRunResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { createSuite } from 'createSuite';
import { TTypedMethods, getTypedMethods } from 'getTypedMethods';

export function staticSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB
>(suiteCallback: T): StaticSuite<F, G, T> {
  return assign(
    (...args: Parameters<T>) => createSuite<F, G, T>(suiteCallback)(...args),
    {
      ...getTypedMethods<F, G>(),
    }
  );
}

type StaticSuite<
  F extends TFieldName = string,
  G extends TGroupName = string,
  T extends CB = CB
> = ((...args: Parameters<T>) => SuiteRunResult<F, G>) & TTypedMethods<F, G>;
