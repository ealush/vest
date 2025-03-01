import { createCascade } from 'context';
import { assign, TinyState, tinyState, DynamicValue } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { Modes } from 'Modes';
import { SuiteSummary, TFieldName, TGroupName } from 'SuiteResultTypes';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  return assign(
    {
      inclusion: {},
      mode: tinyState.createTinyState<Modes>(Modes.EAGER),
      suiteParams: [],
      summary: new SuiteSummary(),
    },
    ctxRef,
  );
});

type CTXType = {
  inclusion: Record<string, DynamicValue<boolean>>;
  mode: TinyState<Modes>;
  suiteParams: any[];
  currentTest?: TIsolateTest;
  skipped?: boolean;
  omitted?: boolean;
  summary: SuiteSummary<TFieldName, TGroupName>;
};

export function useCurrentTest(msg?: string) {
  return SuiteContext.useX(msg).currentTest;
}

export function useSummary<F extends TFieldName, G extends TGroupName>() {
  return SuiteContext.useX().summary as SuiteSummary<F, G>;
}

export function useInclusion() {
  return SuiteContext.useX().inclusion;
}

export function useMode() {
  return SuiteContext.useX().mode();
}

export function useSkipped() {
  return SuiteContext.useX().skipped ?? false;
}

export function useOmitted() {
  return SuiteContext.useX().omitted ?? false;
}

export function useSuiteParams() {
  return SuiteContext.useX().suiteParams;
}
