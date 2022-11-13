export enum IsolateTypes {
  DEFAULT,
}

export type Isolate = {
  type: IsolateTypes;
  path: number[];
  cursor: number;
};
