export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;

export type Stringable = string | ((...args: any[]) => string);

export type CB = (...args: any[]) => any;

export type ValueOf<T> = T[keyof T];
