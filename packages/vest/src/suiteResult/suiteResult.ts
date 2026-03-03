import { assign } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';
import { VestRuntime } from 'vestjs-runtime';

import { useSuiteResultCache } from '../core/Runtime';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';

import { Severity } from './Severity';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
  TSchema,
} from './SuiteResultTypes';
import { suiteSelectors } from './selectors/suiteSelectors';
import { useProduceSuiteSummary } from './selectors/useProduceSuiteSummary';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
>(
  schema?: S,
  outputData?: any,
  inputData?: D,
  runTime: Date = new Date(),
): SuiteResult<F, G, S, D> {
  return useSuiteResultCache<F, G, S, D>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G, D>();
    summary.run = {
      data: inputData,
      time: runTime,
    };

    const resultBody = constructSuiteResultObject<F, G, S, D>(
      summary,
      outputData,
    );

    const result = assign(resultBody as SuiteResult<F, G, S, D>, {
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
      getData: () =>
        !resultBody.hasErrors() && schema ? outputData : inputData,
      types: (schema
        ? { input: inputData, output: outputData }
        : undefined) as SuiteResult<F, G, S, D>['types'],
    }) as SuiteResult<F, G, S, D>;

    const runMeta = Object.freeze({ ...summary.run });

    Object.defineProperty(result, 'run', {
      configurable: true,
      enumerable: false,
      value: runMeta,
      writable: true,
    });

    return Object.freeze(result);
  });
}

export function constructSuiteResultObject<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
  D = unknown,
>(
  summary: SuiteSummary<F, G, D>,
  outputData?: any,
): Omit<SuiteResult<F, G, S, D>, 'dump' | 'types' | 'getData'> {
  const { valid, ...summaryWithoutValid } = summary;
  const selectors = suiteSelectors<F, G>(summary);

  const common = assign(summaryWithoutValid, selectors);

  if (valid === true) {
    return {
      ...common,
      valid: true,
      value: outputData,
    };
  } else if (valid === false) {
    const issues = summary[Severity.ERRORS].reduce((acc, failure) => {
      if (failure.message) {
        acc.push({
          message: failure.message,
          path: [failure.fieldName],
        });
      }
      return acc;
    }, [] as StandardSchemaV1.Issue[]);

    return {
      ...common,
      valid: false,
      issues,
    };
  }

  // valid is null
  return {
    ...common,
    valid: null as null,
  };
}
