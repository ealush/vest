import { Maybe, invariant } from 'vest-utils';
import { TIsolate, IsolateSelectors } from 'vestjs-runtime';

import type { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function isIsolateTest(
  isolate?: Maybe<TIsolate>
): isolate is TIsolateTest {
  return IsolateSelectors.isIsolateType<TIsolateTest>(
    isolate,
    VestIsolateType.Test
  );
}

export function isIsolateTestX(
  isolate: TIsolate
): asserts isolate is TIsolateTest {
  invariant(isIsolateTest(isolate));
}

export function castIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(isolate: TIsolate): TIsolateTest<F, G> {
  isIsolateTestX(isolate);

  return isolate as TIsolateTest<F, G>;
}
