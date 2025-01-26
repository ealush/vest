import { asArray, CB, isNotNull, isNullish, OneOrMoreOf } from 'vest-utils';
import { Isolate, IsolateSelectors, TIsolate, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { SuiteSummary, TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export function dependsOn<F extends TFieldName>(
  deps: OneOrMoreOf<F>,
  callback: CB,
): void {
  const dependencies = new Set(asArray(deps));

  Isolate.create(VestIsolateType.DependsOn, callback, {
    dependencies,
  });
}

export function hasInvalidDependencies<
  F extends TFieldName,
  G extends TGroupName,
>(testObject: TIsolateTest, summary: SuiteSummary<F, G>): boolean {
  const dependsOn = Walker.closest<TIsolateDependsOn>(testObject, i =>
    IsolateSelectors.isIsolateType(i, VestIsolateType.DependsOn),
  );

  if (isNullish(dependsOn)) {
    return false;
  }

  for (const dependency of dependsOn.data.dependencies as Set<F>) {
    if (!summary.tests[dependency].valid) {
      return true;
    }
  }

  return false;
}

export type IsolateDependsOnPayload = {
  dependencies: Set<TFieldName>;
};

type TIsolateDependsOn = TIsolate<IsolateDependsOnPayload>;
