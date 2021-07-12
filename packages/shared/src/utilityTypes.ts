export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;
