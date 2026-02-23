import { assign, freezeAssign } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';
import { VestRuntime } from 'vestjs-runtime';

import { useSuiteResultCache } from '../core/Runtime';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';

import { Severity } from './Severity';
import {
  InferSchemaData,
  InferSchemaOutput,
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
>(
  schema?: S,
  outputData?: InferSchemaOutput<S>,
  inputData?: InferSchemaData<S>,
): SuiteResult<F, G, S> {
  return useSuiteResultCache<F, G, S>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();
    const resultBody = constructSuiteResultObject<F, G, S>(summary, outputData);
    const frozenTypes = schema
      ? Object.freeze({ input: inputData, output: outputData })
      : undefined;

    return freezeAssign(resultBody as SuiteResult<F, G, S>, {
      dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
      types: frozenTypes as SuiteResult<F, G, S>['types'],
    }) as SuiteResult<F, G, S>;
  });
}

export function constructSuiteResultObject<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema = undefined,
>(
  summary: SuiteSummary<F, G>,
  outputData?: InferSchemaOutput<S>,
): Omit<SuiteResult<F, G, S>, 'dump' | 'types'> {
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
        if (failure.fieldName !== undefined) {
          acc.push({
            message: failure.message,
            path: [failure.fieldName],
          });
        } else {
          acc.push({
            message: failure.message,
          });
        }
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
