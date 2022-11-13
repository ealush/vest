import { IsolateTypes } from './isolateTypes';

function isolate<T>(type: IsolateTypes, callback: IsolateCb<T>): T {
  const result = callback();

  return result;
}

type IsolateCb<T> = (...args: any[]) => T;
