type EnforceExtendMap<T> = {
  [K in keyof T]: (...args: any[]) => RuleReturn<T>;
};

interface IEnforceTemplateReturn {
  (value: any): IEnforceRules;
  test: (...args: any[]) => boolean;
}

type RuleReturn<T> = IEnforceRules<T> & EnforceExtendMap<T>;

type TNumeral = number | string;
type RuleNumeral<T> = (expected: TNumeral) => RuleReturn<T>;
type RuleRange<T> = (start: TNumeral, end: TNumeral) => RuleReturn<T>;
type RuleNoExpectedValue<T> = () => RuleReturn<T>;
type RuleString<T> = (str: string) => RuleReturn<T>;
type RuleMatches<T> = (expected: string | RegExp) => RuleReturn<T>;
type RuleAny<T> = (expected: any) => RuleReturn<T>;
type RuleInside<T> = (
  expected: Array<string | number | boolean> | string
) => RuleReturn<T>;

type TLazyOrTemplate = TEnforceLazy | IEnforceTemplateReturn;

type CompoundListOfRules<T> = (...rules: TLazyOrTemplate[]) => RuleReturn<T>;
type TShapeObject = {
  [key: string]: TLazyOrTemplate;
};
interface IEnforceRules<T = {}> {
  [key: string]: (...args: any[]) => RuleReturn<T>;
  equals: RuleAny<T>;
  notEquals: RuleAny<T>;
  numberEquals: RuleNumeral<T>;
  greaterThan: RuleNumeral<T>;
  greaterThanOrEquals: RuleNumeral<T>;
  lessThan: RuleNumeral<T>;
  lessThanOrEquals: RuleNumeral<T>;
  longerThan: RuleNumeral<T>;
  longerThanOrEquals: RuleNumeral<T>;
  shorterThan: RuleNumeral<T>;
  shorterThanOrEquals: RuleNumeral<T>;
  gt: RuleNumeral<T>;
  gte: RuleNumeral<T>;
  lt: RuleNumeral<T>;
  lte: RuleNumeral<T>;
  isBetween: RuleRange<T>;
  endsWith: RuleString<T>;
  startsWith: RuleString<T>;
  doesNotEndWith: RuleString<T>;
  doesNotStartWith: RuleString<T>;
  numberNotEquals: RuleNumeral<T>;
  matches: RuleMatches<T>;
  notMatches: RuleMatches<T>;
  isUndefined: RuleNoExpectedValue<T>;
  isArray: RuleNoExpectedValue<T>;
  isEmpty: RuleNoExpectedValue<T>;
  isEven: RuleNoExpectedValue<T>;
  isBoolean: RuleNoExpectedValue<T>;
  isNotBoolean: RuleNoExpectedValue<T>;
  isNumber: RuleNoExpectedValue<T>;
  isNaN: RuleNoExpectedValue<T>;
  isNotNaN: RuleNoExpectedValue<T>;
  isNull: RuleNoExpectedValue<T>;
  isNotNull: RuleNoExpectedValue<T>;
  isNumeric: RuleNoExpectedValue<T>;
  isOdd: RuleNoExpectedValue<T>;
  isTruthy: RuleNoExpectedValue<T>;
  isFalsy: RuleNoExpectedValue<T>;
  isString: RuleNoExpectedValue<T>;
  isNotArray: RuleNoExpectedValue<T>;
  isNotEmpty: RuleNoExpectedValue<T>;
  isNotNumber: RuleNoExpectedValue<T>;
  isNotNumeric: RuleNoExpectedValue<T>;
  isNotBetween: RuleRange<T>;
  isNotString: RuleNoExpectedValue<T>;
  inside: RuleInside<T>;
  notInside: RuleInside<T>;
  lengthEquals: RuleNumeral<T>;
  lengthNotEquals: RuleNumeral<T>;
  isNegative: RuleNumeral<T>;
  isPositive: RuleNumeral<T>;
  loose: <T>(shape: TShapeObject) => RuleReturn<T>;
  shape: <T>(
    shape: TShapeObject,
    options?: {
      loose?: boolean;
    }
  ) => RuleReturn<T>;
  isArrayOf: CompoundListOfRules<T>;
  anyOf: CompoundListOfRules<T>;
  oneOf: CompoundListOfRules<T>;
}

interface IEnforce {
  /**
   * Assertion function. Throws an error on failure.
   * @param value Value being enforced
   */
  (value: any): IEnforceRules;

  /**
   * Adds custom rules to enforce
   * @param rules Rules object to add onto enforce
   *
   * @example
   *
   * const customEnforce = enforce.extend({
   *  isValidEmail: (email) => email.includes('@')
   * });
   *
   * customEnforce('notAnEmail') // throws an error
   */
  extend<T extends { [key: string]: (value: any, ...args: any[]) => boolean }>(
    obj: T
  ): (value: any) => IEnforceRules<T> & EnforceExtendMap<T>;

  template: (...rules: Array<TLazyOrTemplate>) => IEnforceTemplateReturn;
}

type LazyNumeral = (expected: TNumeral) => TEnforceLazyReturn;
type LazyEnforceWithNoArgs = () => TEnforceLazyReturn;
type LazyString = (str: string) => TEnforceLazyReturn;
type LazyRange = (start: number, end: number) => TEnforceLazyReturn;
type LazyMatches = (expected: string | RegExp) => TEnforceLazyReturn;
type LazyAny = (expected: any) => TEnforceLazyReturn;
type LazyInside = (
  expected: Array<string | number | boolean> | string
) => TEnforceLazyReturn;
type LazyCopmoundListOfRules = <T>(
  ...rules: TLazyOrTemplate[]
) => TEnforceLazyReturn;

type TEnforceLazyReturn = TEnforceLazy & { test: (...args: any[]) => boolean };

type TEnforceLazy = {
  [key: string]: (...args: any[]) => TEnforceLazyReturn;
  equals: LazyAny;
  notEquals: LazyAny;
  numberEquals: LazyNumeral;
  greaterThan: LazyNumeral;
  greaterThanOrEquals: LazyNumeral;
  lessThan: LazyNumeral;
  lessThanOrEquals: LazyNumeral;
  longerThan: LazyNumeral;
  longerThanOrEquals: LazyNumeral;
  shorterThan: LazyNumeral;
  shorterThanOrEquals: LazyNumeral;
  gt: LazyNumeral;
  gte: LazyNumeral;
  lt: LazyNumeral;
  lte: LazyNumeral;
  isBetween: LazyRange;
  endsWith: LazyString;
  startsWith: LazyString;
  doesNotEndWith: LazyString;
  doesNotStartWith: LazyString;
  numberNotEquals: LazyNumeral;
  matches: LazyMatches;
  notMatches: LazyMatches;
  isUndefined: LazyEnforceWithNoArgs;
  isArray: LazyEnforceWithNoArgs;
  isEmpty: LazyEnforceWithNoArgs;
  isEven: LazyEnforceWithNoArgs;
  isNumber: LazyEnforceWithNoArgs;
  isNaN: LazyEnforceWithNoArgs;
  isNotNaN: LazyEnforceWithNoArgs;
  isNull: LazyEnforceWithNoArgs;
  isNotNull: LazyEnforceWithNoArgs;
  isNumeric: LazyEnforceWithNoArgs;
  isOdd: LazyEnforceWithNoArgs;
  isTruthy: LazyEnforceWithNoArgs;
  isFalsy: LazyEnforceWithNoArgs;
  isString: LazyEnforceWithNoArgs;
  isNotArray: LazyEnforceWithNoArgs;
  isNotEmpty: LazyEnforceWithNoArgs;
  isNotNumber: LazyEnforceWithNoArgs;
  isNotNumeric: LazyEnforceWithNoArgs;
  isNotBetween: LazyRange;
  isNotString: LazyEnforceWithNoArgs;
  inside: LazyInside;
  notInside: LazyInside;
  lengthEquals: LazyNumeral;
  lengthNotEquals: LazyNumeral;
  isNegative: LazyEnforceWithNoArgs;
  isPositive: LazyEnforceWithNoArgs;
  isBoolean: LazyEnforceWithNoArgs;
  isNotBoolean: LazyEnforceWithNoArgs;
  loose: <T>(shape: TShapeObject) => TEnforceLazyReturn;
  shape: <T>(
    shape: TShapeObject,
    options?: {
      loose?: boolean;
    }
  ) => TEnforceLazyReturn;
  optional: LazyCopmoundListOfRules;
  isArrayOf: LazyCopmoundListOfRules;
  anyOf: LazyCopmoundListOfRules;
  oneOf: LazyCopmoundListOfRules;
};

export type TEnforce = IEnforce & TEnforceLazyReturn;
