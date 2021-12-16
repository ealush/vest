import VestTest from 'VestTest';

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
