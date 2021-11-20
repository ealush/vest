type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;
type TStringable = string | ((...args: any[]) => string);
type TRuleReturn =
  | boolean
  | {
      pass: boolean;
      message?: TStringable;
    };
type TRuleDetailedResult = {
  pass: boolean;
  message?: string;
};
type TArgs = any[];
type TBaseRules = typeof baseRules;
type KBaseRules = keyof TBaseRules;
declare function condition(
  value: any,
  callback: (value: any) => TRuleReturn
): TRuleReturn;
declare function endsWith(value: string, arg1: string): boolean;
declare function equals(value: unknown, arg1: unknown): boolean;
declare function greaterThan(
  value: number | string,
  gt: number | string
): boolean;
declare function greaterThanOrEquals(
  value: string | number,
  gte: string | number
): boolean;
declare function inside(value: unknown, arg1: string | unknown[]): boolean;
// The module is named "isArrayValue" since it
// is conflicting with a nested npm dependency.
// We may need to revisit this in the future.
declare function isArray(value: unknown): value is Array<unknown>;
declare function isBetween(
  value: number | string,
  min: number | string,
  max: number | string
): boolean;
declare function isBlank(value: unknown): boolean;
declare function isBoolean(value: unknown): value is boolean;
declare function isEmpty(value: unknown): boolean;
declare function isNaN(value: unknown): boolean;
declare function isNegative(value: number | string): boolean;
declare function isNull(value: unknown): value is null;
declare function isNumber(value: unknown): value is number;
declare function isNumeric(value: string | number): boolean;
declare function isStringValue(v: unknown): v is string;
declare function isTruthy(value: unknown): boolean;
declare function isUndefined(value?: unknown): boolean;
declare function lengthEquals(
  value: string | unknown[],
  arg1: string | number
): boolean;
declare function lessThan(value: string | number, lt: string | number): boolean;
declare function lessThanOrEquals(
  value: string | number,
  lte: string | number
): boolean;
declare function longerThan(
  value: string | unknown[],
  arg1: string | number
): boolean;
declare function longerThanOrEquals(
  value: string | unknown[],
  arg1: string | number
): boolean;
declare function matches(value: string, regex: RegExp | string): boolean;
declare function numberEquals(
  value: string | number,
  eq: string | number
): boolean;
declare function shorterThan(
  value: string | unknown[],
  arg1: string | number
): boolean;
declare function shorterThanOrEquals(
  value: string | unknown[],
  arg1: string | number
): boolean;
declare function startsWith(value: string, arg1: string): boolean;
declare const baseRules: {
  condition: typeof condition;
  doesNotEndWith: (value: string, arg1: string) => boolean;
  doesNotStartWith: (value: string, arg1: string) => boolean;
  endsWith: typeof endsWith;
  equals: typeof equals;
  greaterThan: typeof greaterThan;
  greaterThanOrEquals: typeof greaterThanOrEquals;
  gt: typeof greaterThan;
  gte: typeof greaterThanOrEquals;
  inside: typeof inside;
  isArray: typeof isArray;
  isBetween: typeof isBetween;
  isBlank: typeof isBlank;
  isBoolean: typeof isBoolean;
  isEmpty: typeof isEmpty;
  isEven: (value: any) => boolean;
  isFalsy: (value: unknown) => boolean;
  isNaN: typeof isNaN;
  isNegative: typeof isNegative;
  isNotArray: (value: unknown) => boolean;
  isNotBetween: (
    value: string | number,
    min: string | number,
    max: string | number
  ) => boolean;
  isNotBlank: (value: unknown) => boolean;
  isNotBoolean: (value: unknown) => boolean;
  isNotEmpty: (value: unknown) => boolean;
  isNotNaN: (value: unknown) => boolean;
  isNotNull: (value: unknown) => boolean;
  isNotNumber: (value: unknown) => boolean;
  isNotNumeric: (value: string | number) => boolean;
  isNotString: (v: unknown) => boolean;
  isNotUndefined: (value?: unknown) => boolean;
  isNull: typeof isNull;
  isNumber: typeof isNumber;
  isNumeric: typeof isNumeric;
  isOdd: (value: any) => boolean;
  isPositive: (value: string | number) => boolean;
  isString: typeof isStringValue;
  isTruthy: typeof isTruthy;
  isUndefined: typeof isUndefined;
  lengthEquals: typeof lengthEquals;
  lengthNotEquals: (
    value: string | unknown[],
    arg1: string | number
  ) => boolean;
  lessThan: typeof lessThan;
  lessThanOrEquals: typeof lessThanOrEquals;
  longerThan: typeof longerThan;
  longerThanOrEquals: typeof longerThanOrEquals;
  lt: typeof lessThan;
  lte: typeof lessThanOrEquals;
  matches: typeof matches;
  notEquals: (value: unknown, arg1: unknown) => boolean;
  notInside: (value: unknown, arg1: string | unknown[]) => boolean;
  notMatches: (value: string, regex: string | RegExp) => boolean;
  numberEquals: typeof numberEquals;
  numberNotEquals: (value: string | number, eq: string | number) => boolean;
  shorterThan: typeof shorterThan;
  shorterThanOrEquals: typeof shorterThanOrEquals;
  startsWith: typeof startsWith;
};
type TRules<E = Record<string, unknown>> = n4s.EnforceCustomMatchers<
  TRules<E> & E
> &
  Record<string, (...args: TArgs) => TRules<E> & E> &
  {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<TBaseRules[P]>> | TArgs
    ) => TRules<E> & E;
  };
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare global {
  namespace n4s {
    interface IRules<E> extends TRules<E> {}
  }
}
type TLazyRules = n4s.IRules<TLazyRuleMethods>;
type TLazy = TLazyRules &
  TLazyRuleMethods &
  // This is a "catch all" hack to make TS happy while not
  // losing type hints
  Record<string, (...args: any[]) => any>;
type TLazyRuleMethods = TLazyRuleRunners & {
  message: (message: TLazyMessage) => TLazy;
};
type TLazyRuleRunners = {
  test: (value: unknown) => boolean;
  run: (value: unknown) => TRuleDetailedResult;
};
type TComposeResult = TLazyRuleRunners & ((value: any) => void);
type TLazyMessage =
  | string
  | ((value: unknown, originalMessage?: TStringable) => string);
declare function compose(...composites: TLazyRuleRunners[]): TComposeResult;
export { compose as default };
