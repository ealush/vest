import { VestTest } from 'VestTest';

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

export type Isolate<T = IsolateTypes, D = any> = {
  type: T;
  children: Isolate[];
  keys: Record<string, Isolate>;
  parent: Isolate | null;
  data?: D;
  cursor: number;
  output?: any;
};

export type IsolateTest = Isolate<IsolateTypes.TEST, VestTest>;
