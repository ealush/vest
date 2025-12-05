import { TIsolate } from './Isolate/IsolateTypes';

export type RuntimeEvents = {
  ASYNC_ISOLATE_DONE: TIsolate;
  BECOME_STABLE: void;
  END_MOUNT: void;
  ISOLATE_DONE: TIsolate;
  ISOLATE_ENTER: TIsolate;
  ISOLATE_PENDING: TIsolate;
  ISOLATE_RECONCILED: TIsolate;
  START_MOUNT: void;
};
