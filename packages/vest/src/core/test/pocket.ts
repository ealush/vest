import drillArray from 'drillArray';
import flatten from 'flatten';
import isFunction from 'isFunction';
import type { NestedArray } from 'nestedArray';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { addCursorLevel, removeCursorLevel, useCursorAt } from 'cursorAt';
import {
  useTestObjects,
  useRefreshTestObjects,
  usePrevTestObjects,
} from 'stateHooks';

export function pocket(
  { type = PocketType.DEFAULT }: { type?: PocketType },
  callback: () => void
): void {
  if (!isFunction(callback)) {
    return;
  }

  ctx.run({ pocket: { type } }, () => {
    addCursorLevel();
    callback();
    removeCursorLevel();
  });
}

export enum PocketType {
  DEFAULT,
  SUITE,
  EACH,
}

export function useCurrentPocket(): NestedArray<VestTest> {
  const [testObjects] = useTestObjects();
  const cursorAt = ctx.useX().cursorAt;
  return drillArray(testObjects, cursorAt);
}

function useParentPocket(): NestedArray<VestTest> {
  const [testObjects] = useTestObjects();
  const cursorAt = ctx.useX().cursorAt;

  return drillArray(testObjects, cursorAt.slice(0, -2));
}

// export function useAddTestToPocket(testOblect: VestTest): void {}

export function setCurrentPocket(
  callback: (testObjects: Array<VestTest>) => NestedArray<VestTest>
): void {
  const currentPocket = useCurrentPocket();
  const cursorAt = useCursorAt();
  const parentPocket = useParentPocket();

  parentPocket[cursorAt] = callback(flatten(currentPocket));
  useRefreshTestObjects();
}

// export function useRemoveTestFromPocket(testOblect: VestTest): void { }

export function usePrevRunPocket(): NestedArray<VestTest> {
  const [prevTestObjects] = usePrevTestObjects();
  const cursorAt = ctx.useX().cursorAt;

  return drillArray(prevTestObjects, cursorAt);
}
