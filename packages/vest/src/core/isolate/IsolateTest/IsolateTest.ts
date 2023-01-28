import { IsolateTestReconciler } from './IsolateTestReconciler';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';

export class IsolateTest extends Isolate<IsolateTypes.TEST, VestTest> {
  static reconciler = IsolateTestReconciler;

  constructor(type: IsolateTypes.TEST, data: VestTest) {
    super(type, data);
    this.data = data;

    this.setKey(data.key);
  }
}
