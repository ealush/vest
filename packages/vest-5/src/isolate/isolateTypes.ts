export enum IsolateTypes {
  DEFAULT = 'DEFAULT',
  TEST = 'TEST',
  SUITE = 'SUITE',
  EACH = 'EACH',
  GROUP = 'GROUP',
}

export type Isolate<T> = {
  type: IsolateTypes;
  cursor: number;
  children: Isolate<T>[];
  data?: T | undefined;
};
