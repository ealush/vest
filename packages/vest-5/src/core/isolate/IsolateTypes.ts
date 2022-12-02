export enum IsolateTypes {
  DEFAULT = 'DEFAULT',
  TEST = 'TEST',
  SUITE = 'SUITE',
  EACH = 'EACH',
  GROUP = 'GROUP',
  SKIP_WHEN = 'SKIP_WHEN',
  OMIT_WHEN = 'OMIT_WHEN',
  TEST_MEMO = 'TEST_MEMO',
}

export type Isolate = {
  type: IsolateTypes;
  children: Isolate[];
  keys: Record<string, any>;
  parent: Isolate | null;
  data?: any;
  cursor: number;
  output?: any;
};
