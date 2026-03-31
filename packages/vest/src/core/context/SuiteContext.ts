import { createCascade } from 'context';
import { assign, TinyState, createTinyState, DynamicValue } from 'vest-utils';

import { Modes } from '../../hooks/optional/Modes';
import { SuiteModifiers } from '../../suite/SuiteTypes';
import { TFieldName, TSchema } from '../../suiteResult/SuiteResultTypes';
import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

export const SuiteContext = createCascade<CTXType>((ctxRef, parentContext) => {
  if (parentContext) {
    return null;
  }

  return assign(
    {
      inclusion: {},
      mode: createTinyState<Modes>(Modes.EAGER),
      modifiers: {
        onlyGroup: new Set<string>(),
        skipGroup: new Set<string>(),
      },
      schema: null,
      suiteParams: [],
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
  schema: TSchema;
  modifiers: TInternalModifiers<TFieldName>;
};

export type TInternalModifiers<F extends TFieldName = TFieldName> = Omit<
  SuiteModifiers<F>,
  'onlyGroup' | 'skipGroup'
> & {
  onlyGroup: Set<string>;
  skipGroup: Set<string>;
};

export function useCurrentTest(msg?: string) {
  return SuiteContext.useX(msg).currentTest;
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

export function useSuiteParams() {
  return SuiteContext.useX().suiteParams;
}
