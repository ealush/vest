import { invariant } from 'vest-utils';
import { Bus, RuntimeEvents, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { VestIsolate } from 'VestIsolate';
import { isVestIsolate } from 'VestIsolateType';
import { VestTest } from 'VestTest';

export function registerTestNodes(isolate: TIsolate) {
  const tests: TIsolateTest[] = [];

  const parent = VestIsolate.getParent(isolate);

  if (!parent) {
    return;
  }

  invariant(parent.children, 'Expected parent to have children');

  parent.data.tests = parent.children.reduce((tests, current) => {
    if (VestTest.is(current)) {
      tests.push(current);
    }

    if (isVestIsolate(current)) {
      tests.push(...current.data.tests);
    }

    return tests;
  }, tests);
}

// Traverses all the way up and registers all test nodes all the way up to the suite level
export function registerTestsTraverseUp(isolate: TIsolate) {
  let next = isolate.parent;

  while (next) {
    if (!isVestIsolate(next)) {
      return;
    }

    registerTestNodes(next);
    next = next.parent;
  }
}

export function onTestStart(testObject: TIsolateTest) {
  registerTestNodes(testObject);
}

export function reprocessTree(rootNode: TIsolate): void {
  if (!rootNode.children) {
    return;
  }

  const emit = Bus.useEmit();

  for (const child of rootNode.children) {
    reprocessTree(child);
    emit(RuntimeEvents.ISOLATE_RECONCILED, child);
  }
}
