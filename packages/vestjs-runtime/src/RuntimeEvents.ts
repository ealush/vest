import { TIsolate } from './Isolate/IsolateTypes';

export type RuntimeEvents = {
  ASYNC_ISOLATE_DONE: TIsolate;
  ISOLATE_DONE: TIsolate;
  ISOLATE_ENTER: TIsolate;
  ISOLATE_PENDING: TIsolate;
  ISOLATE_RECONCILED: TIsolate;
};
