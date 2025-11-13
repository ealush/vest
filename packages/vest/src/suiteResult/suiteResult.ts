import { assign, freezeAssign, Maybe } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { useSuiteName, useSuiteResultCache, useSuiteSchema } from 'Runtime';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { suiteSelectors } from 'suiteSelectors';
import { useProduceSuiteSummary } from 'useProduceSuiteSummary';

// Import schema-related types from n4s
import type { RuleInstance } from 'n4s';

export function useCreateSuiteResult<
  F extends TFieldName,
  G extends TGroupName,
  S extends RuleInstance<any> | undefined = undefined,
>(): SuiteResult<F, G, S> {
  return useSuiteResultCache<F, G, S>(() => {
    // @vx-allow use-use
    const summary = useProduceSuiteSummary<F, G>();

    // @vx-allow use-use
    const suiteName = useSuiteName();

    // @vx-allow use-use
    const schema = useSuiteSchema() as S | undefined;

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
  S extends RuleInstance<any> | undefined = undefined,
>(
  summary: SuiteSummary<F, G>,
  suiteName?: Maybe<string>,
  schema?: S,
): SuiteResult<F, G, S> {
  const types = schema !== undefined ? ({} as any) : undefined;

  // TODO: Implement automatic schema validation on suite.run()
  // When schema is provided, we should validate the data against it
  // and potentially add validation errors to the suite result

  return assign(summary, suiteSelectors<F, G>(summary), {
    suiteName,
    types,
  }) as SuiteResult<F, G, S>;
}
