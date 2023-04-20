import { CB, assign } from 'vest-utils';

import { SuiteRunResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { createSuite } from 'createSuite';
import { TTypedMethods, getTypedMethods } from 'getTypedMethods';

export function staticSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
>(suiteCallback: T): StaticSuite<T, F, G> {
  return assign(
    (...args: Parameters<T>) => createSuite<T, F, G>(suiteCallback)(...args),
    {
      ...getTypedMethods<F, G>(),
    }
  );
}

type StaticSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
> = ((...args: Parameters<T>) => SuiteRunResult<F, G>) & TTypedMethods<F, G>;
