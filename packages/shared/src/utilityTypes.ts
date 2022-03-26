export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;

export type Stringable = string | ((...args: any[]) => string);

export type CB = (...args: any[]) => void;
