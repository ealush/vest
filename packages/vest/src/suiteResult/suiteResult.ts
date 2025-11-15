import type { RuleInstance } from 'n4s';
import { assign, freezeAssign, Maybe } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { useSuiteName, useSuiteResultCache } from 'Runtime';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
  SuiteSchemaTypes,
} from 'SuiteResultTypes';
import { suiteSelectors } from 'suiteSelectors';
import { useProduceSuiteSummary } from 'useProduceSuiteSummary';

type SuiteSchemaData<S extends RuleInstance<any, any> | undefined> =
  SuiteSchemaTypes<S> extends { data: infer D } ? D : never;

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
  S extends RuleInstance<any, any> | undefined = undefined,
>(schema?: S): SuiteResult<F, G, S> {
  return useSuiteResultCache<F, G, S>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();

    // @vx-allow use-use
    const suiteName = useSuiteName();

    return freezeAssign(
      constructSuiteResultObject<F, G, S>(summary, suiteName, schema),
      {
        dump: VestRuntime.persist(VestRuntime.useAvailableRoot<TIsolateSuite>),
      },
    ) as SuiteResult<F, G, S>;
  });
}

export function constructSuiteResultObject<
  F extends TFieldName,
  G extends TGroupName,
  S extends RuleInstance<any, any> | undefined = undefined,
>(
  summary: SuiteSummary<F, G>,
  suiteName?: Maybe<string>,
  schema?: S,
): SuiteResult<F, G, S> {
  const types = schema
    ? ({
        data: undefined as unknown as SuiteSchemaData<S>,
        schema,
      } as SuiteSchemaTypes<S>)
    : (undefined as SuiteSchemaTypes<S>);

  return assign(summary, suiteSelectors<F, G>(summary), {
    suiteName,
    types,
  }) as SuiteResult<F, G, S>;
}
