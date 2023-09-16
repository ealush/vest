export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;

export type Stringable = string | CB<string>;

export type CB<T = any, Args extends TArgs = TArgs> = (...args: Args) => T;

export type ValueOf<T> = T[keyof T];

export type Nullish<T = void> = Nullable<T> | Maybe<T>;

export type Nullable<T> = T | null;

export type Maybe<T> = T | undefined;

export type OneOrMoreOf<T> = T | T[];

export type DynamicValue<T, Args extends TArgs = TArgs> = T | CB<T, Args>;

export type BlankValue = Maybe<''>;

type TArgs = any[];

export type Predicate<T = any> = boolean | ((value: T) => boolean);
