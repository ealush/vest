export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;

export type TStringable = string | ((...args: any[]) => string);
