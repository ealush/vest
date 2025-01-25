import { asArray, CB, isNotNull, OneOrMoreOf } from 'vest-utils';
import { Isolate, IsolateSelectors, TIsolate, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
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

export function hasDependencies(testObject: TIsolateTest): boolean {
  const dependsOn = Walker.closest<TIsolateDependsOn>(testObject, i =>
    IsolateSelectors.isIsolateType(i, VestIsolateType.DependsOn),
  );

  return isNotNull(dependsOn);
}

export type IsolateDependsOnPayload = {
  dependencies: Set<TFieldName>;
};

type TIsolateDependsOn = TIsolate<IsolateDependsOnPayload>;
