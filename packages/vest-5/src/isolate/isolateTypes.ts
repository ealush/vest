export enum IsolateTypes {
  DEFAULT = 'DEFAULT',
  TEST = 'TEST',
  SUITE = 'SUITE',
  EACH = 'EACH',
  GROUP = 'GROUP',
  SKIP_WHEN = 'SKIP_WHEN',
  OMIT_WHEN = 'OMIT_WHEN',
}

export type Isolate = {
  type: IsolateTypes;
  cursor: number;
  children: Isolate[];
  data?: any;
};
