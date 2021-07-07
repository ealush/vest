export type DropFirst<T extends unknown[]> = T extends [any, ...infer U]
  ? U
  : never;

export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : unknown[];
export type Tail<T extends any[]> = T extends [...any[], infer Tail]
  ? Tail
  : unknown[];
