export enum IsolateTypes {
  DEFAULT,
}

export type Isolate = {
  type: IsolateTypes;
  cursor: number;
  children: Isolate[];
};
