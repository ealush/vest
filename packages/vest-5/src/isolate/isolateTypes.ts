export enum IsolateTypes {
  DEFAULT = 'DEFAULT',
  TEST = 'TEST',
  SUITE = 'SUITE',
  EACH = 'EACH',
  GROUP = 'GROUP',
}

export type Isolate = {
  type: IsolateTypes;
  cursor: number;
  children: Isolate[];
  data?: any;
};
