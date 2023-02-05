import { IsolateTestReconciler } from './IsolateTestReconciler';

import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { Isolate } from 'isolate';

export class IsolateTest extends Isolate<IsolateTypes.TEST, VestTest> {
  static reconciler = IsolateTestReconciler;

  constructor(type: IsolateTypes.TEST, data: VestTest) {
    super(type, data);
    this.data = data;

    this.setKey(data.key);
  }
}
