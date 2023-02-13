import { IsolateTypes } from 'IsolateTypes';
import { Isolate } from 'isolate';

export class IsolateEach extends Isolate<IsolateTypes.EACH> {
  allowReorder = true;
}
