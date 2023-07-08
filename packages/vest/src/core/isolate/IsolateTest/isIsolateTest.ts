import { Maybe, invariant } from 'vest-utils';
import { Isolate, IsolateSelectors } from 'vestjs-runtime';

import type { IsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function isIsolateTest(
  isolate?: Maybe<Isolate>
): isolate is IsolateTest {
  return IsolateSelectors.isIsolateType<IsolateTest>(
    isolate,
    VestIsolateType.Test
  );
}

export function isIsolateTestX(
  isolate: Isolate
): asserts isolate is IsolateTest {
  invariant(isIsolateTest(isolate));
}

export function castIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(isolate: Isolate): IsolateTest<F, G> {
  isIsolateTestX(isolate);

  return isolate as IsolateTest<F, G>;
}
