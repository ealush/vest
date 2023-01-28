import { Reconciler } from 'Reconciler';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { vestReconciler } from 'vestReconciler';

class IsolateTestReconciler extends Reconciler {
  static reconciler(
    currentNode: Isolate,
    historicNode: Isolate | null
  ): Isolate {
    return vestReconciler(historicNode, currentNode);
  }
}

export class IsolateTest extends Isolate<IsolateTypes.TEST, VestTest> {
  static reconciler = IsolateTestReconciler;
}
