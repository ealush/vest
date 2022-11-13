function isolate<T>(type: IsolateTypes, callback: IsolateCb<T>): T {
  const result = callback();

  return result;
}

export enum IsolateTypes {
  DEFAULT,
}

export type Isolate = {
  type: IsolateTypes;
  cursor: number;
  children: Isolate[];
};

type IsolateCb<T> = (...args: any[]) => T;
