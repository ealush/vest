import { Maybe, invariant } from 'vest-utils';
import { TIsolate, IsolateSelectors } from 'vestjs-runtime';

import type { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function isIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(isolate?: Maybe<TIsolate>): isolate is TIsolateTest<F, G> {
  return IsolateSelectors.isIsolateType<TIsolateTest<F, G>>(
    isolate,
    VestIsolateType.Test
  );
}

export function isIsolateTestX<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(isolate: TIsolate): asserts isolate is TIsolateTest<F, G> {
  invariant(isIsolateTest(isolate));
}

export function castIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(isolate: TIsolate): TIsolateTest<F, G> {
  isIsolateTestX(isolate);

  return isolate as TIsolateTest<F, G>;
}
