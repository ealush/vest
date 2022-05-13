import VestTest from 'VestTest';
import { IsolateCursor } from 'isolateCursor';

export enum IsolateTypes {
  DEFAULT,
  SUITE,
  EACH,
  SKIP_WHEN,
  OMIT_WHEN,
  GROUP,
}

export type IsolateKeys = {
  current: Record<string, VestTest>;
  prev: Record<string, VestTest>;
};

export type Isolate = {
  type: IsolateTypes;
  keys: IsolateKeys;
  path: number[];
  cursor: IsolateCursor;
};
