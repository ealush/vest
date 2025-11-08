import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { constructSuiteResultObject, useCreateSuiteResult } from 'suiteResult';

// @vx-allow use-use
export function LazyDraft<
  F extends TFieldName,
  G extends TGroupName,
>(): SuiteResult<F, G> {
  const emptySummary = constructSuiteResultObject(new SuiteSummary<F, G>());

  return new Proxy(emptySummary, {
    get: (_, prop) => {
      const result = useCreateSuiteResult<F, G>();

      return result[prop as keyof SuiteResult<F, G>];
    },
  }) as SuiteResult<F, G>;
}
