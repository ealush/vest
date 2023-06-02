import { invariant } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import type { IsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function isIsolateTest(isolate?: Isolate): isolate is IsolateTest {
  return isolate?.type === VestIsolateType.Test;
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
