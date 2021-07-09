type DropFirst<T extends unknown[]> = T extends [
    any,
    ...infer U
] ? U : never;
type TRuleReturn = boolean | {
    pass: boolean;
    message?: string | (() => string);
};
type TRuleDetailedResult = {
    pass: boolean;
    message?: string;
};
type TLazyRules = TRules<TLazyRuleMethods>;
type TLazy = TLazyRules & TLazyRuleMethods;
type TShapeObject = Record<any, TLazy>;
type TLazyRuleMethods = TLazyRuleRunners & {
    message: (message: TLazyMessage) => TLazy;
};
type TLazyRuleRunners = {
    test: (value: unknown) => boolean;
    run: (value: unknown) => TRuleDetailedResult;
};
type TLazyMessage = string | ((value: unknown, originalMessage?: TStringable) => string);
declare function allOf(value: unknown, ...rules: TLazy[]): TRuleDetailedResult;
declare function anyOf(value: unknown, ...rules: TLazy[]): TRuleDetailedResult;
declare function noneOf(value: unknown, ...rules: TLazy[]): TRuleDetailedResult;
declare function oneOf(value: unknown, ...rules: TLazy[]): TRuleDetailedResult;
    };
    function anyOf(value: unknown, ...rules: TLazyRuleMethods[]): TRuleDetailedResult;
    function noneOf(value: unknown, ...rules: TLazyRuleMethods[]): TRuleDetailedResult;
    function oneOf(value: unknown, ...rules: TLazyRuleMethods[]): TRuleDetailedResult;
    function allOf(value: unknown, ...rules: TLazyRuleMethods[]): TRuleDetailedResult;
}
type TArgs = any[];
type TRuleValue = any;
type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;
type TRule = Record<string, TRuleBase>;
declare function endsWith(value: string, arg1: string): boolean;
declare function equals(value: unknown, arg1: unknown): boolean;
declare function greaterThan(value: unknown, arg1: unknown): boolean;
declare function greaterThanOrEquals(value: unknown, arg1: unknown): boolean;
declare function inside(value: unknown, arg1: string | unknown[]): boolean;
declare function isArray(value: unknown): value is Array<unknown>;
declare function isBetween(value: number | string, min: number | string, max: number | string): boolean;
declare function isEmpty(value: unknown): boolean;
declare function isNaN(value: unknown): boolean;
declare function isNegative(value: any): boolean;
declare function isNull(value: any): value is null;
declare function isNumber(value: any): value is number;
declare function isNumeric(value: any): boolean;
declare function isTruthy(value: unknown): boolean;
declare function isUndefined(value?: unknown): boolean;
declare function lengthEquals(value: string | unknown[], arg1: string | number): boolean;
declare function lessThan(value: unknown, arg1: unknown): boolean;
declare function lessThanOrEquals(value: unknown, arg1: unknown): boolean;
declare function longerThan(value: string | unknown[], arg1: string | number): boolean;
declare function longerThanOrEquals(value: string | unknown[], arg1: string | number): boolean;
declare function matches(value: string, regex: RegExp | string): boolean;
declare function numberEquals(value: unknown, arg1: unknown): boolean;
declare function shorterThan(value: string | unknown[], arg1: string | number): boolean;
declare function shorterThanOrEquals(value: string | unknown[], arg1: string | number): boolean;
declare function startsWith(value: string, arg1: string): boolean;
declare const baseRules: {
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
    isBoolean: typeof default;
    isEmpty: typeof isEmpty;
    isEven: (value: number) => boolean;
    isFalsy: (value: unknown) => boolean;
    isNaN: typeof isNaN;
    isNegative: typeof isNegative;
    isNotArray: (value: unknown) => boolean;
    isNotBetween: (value: string | number, min: string | number, max: string | number) => boolean;
    isNotBoolean: (value: unknown) => boolean;
    isNotEmpty: (value: unknown) => boolean;
    isNotNaN: (value: unknown) => boolean;
    isNotNull: (value: any) => boolean;
    isNotNumber: (value: any) => boolean;
    isNotNumeric: (value: any) => boolean;
    isNotString: (v: unknown) => boolean;
    isNotUndefined: (value?: unknown) => boolean;
    isNull: typeof isNull;
    isNumber: typeof isNumber;
    isNumeric: typeof isNumeric;
    isOdd: (value: any) => boolean;
    isPositive: (value: any) => boolean;
    isString: typeof default;
    isTruthy: typeof isTruthy;
    isUndefined: typeof isUndefined;
    lengthEquals: typeof lengthEquals;
    lengthNotEquals: (value: string | unknown[], arg1: string | number) => boolean;
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
    numberNotEquals: (value: unknown, arg1: unknown) => boolean;
    shorterThan: typeof shorterThan;
    shorterThanOrEquals: typeof shorterThanOrEquals;
    startsWith: typeof startsWith;
};
declare const rules: typeof baseRules & Record<string, (...args: TArgs) => TRuleReturn>;
declare function EnforceBase(value: TRuleValue): TEaegerRules;
declare const enforce: TEnforce;
type TEaegerRules = {
    [P in keyof typeof compounds]: (...args: DropFirst<Parameters<typeof compounds[P]>>) => TEaegerRules;
} & {
    [P in keyof typeof rules]: (...args: DropFirst<Parameters<typeof rules[P]>>) => TEaegerRules;
};
type TLazyRules = {
    [P in keyof typeof compounds]: (...args: DropFirst<Parameters<typeof compounds[P]>>) => TLazyRules & TLazyRuleMethods;
} & {
    [P in keyof typeof rules]: (...args: DropFirst<Parameters<typeof rules[P]>>) => TLazyRules & TLazyRuleMethods;
};
type TEnforce = typeof EnforceBase & TLazyRules & {
    extend: (customRules: TRule) => void;
};
export { enforce as default };
//# sourceMappingURL=n4s.d.ts.map
