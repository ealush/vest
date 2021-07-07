type TEnforceContext = null | {
    meta: Record<string, any>;
    value: any;
    parent: () => TEnforceContext;
};
type DropFirst<T extends unknown[]> = T extends [
    unknown,
    ...infer U
] ? U : never;
type TStringable = string | ((...args: any[]) => string);
type TRuleReturn = boolean | {
    pass: boolean;
    message?: TStringable;
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
declare function optional(value: any, ruleChain: TLazy): TRuleDetailedResult;
declare function compounds(): {
    allOf: typeof allOf;
    anyOf: typeof anyOf;
    noneOf: typeof noneOf;
    oneOf: typeof oneOf;
    optional: typeof optional;
};
type TCompounds = ReturnType<typeof compounds>;
type KCompounds = keyof TCompounds;
type TArgs = any[];
type TRuleValue = any;
type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;
type TRule = Record<string, TRuleBase>;
type TBaseRules = typeof baseRules;
type KBaseRules = keyof TBaseRules;
declare function condition(value: any, callback: (value: any) => TRuleReturn): TRuleReturn;
declare function endsWith(value: string, arg1: string): boolean;
declare function equals(value: unknown, arg1: unknown): boolean;
declare function greaterThan(value: number | string, gt: number | string): boolean;
declare function greaterThanOrEquals(value: string | number, gte: string | number): boolean;
declare function inside(value: unknown, arg1: string | unknown[]): boolean;
// The module is named "isArrayValue" since it
// is conflicting with a nested npm dependency.
// We may need to revisit this in the future.
declare function isArray(value: unknown): value is Array<unknown>;
declare function isBetween(value: number | string, min: number | string, max: number | string): boolean;
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
declare function lengthEquals(value: string | unknown[], arg1: string | number): boolean;
declare function lessThan(value: string | number, lt: string | number): boolean;
declare function lessThanOrEquals(value: string | number, lte: string | number): boolean;
declare function longerThan(value: string | unknown[], arg1: string | number): boolean;
declare function longerThanOrEquals(value: string | unknown[], arg1: string | number): boolean;
declare function matches(value: string, regex: RegExp | string): boolean;
declare function numberEquals(value: string | number, eq: string | number): boolean;
declare function shorterThan(value: string | unknown[], arg1: string | number): boolean;
declare function shorterThanOrEquals(value: string | unknown[], arg1: string | number): boolean;
declare function startsWith(value: string, arg1: string): boolean;
declare function shape(inputObject: Record<string, any>, shapeObject: TShapeObject): TRuleDetailedResult;
declare function loose(inputObject: Record<string, any>, shapeObject: TShapeObject): TRuleDetailedResult;
declare function isArrayOf(inputArray: any[], currentRule: TLazy): TRuleDetailedResult;
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
    isNotBetween: (value: string | number, min: string | number, max: string | number) => boolean;
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
    numberNotEquals: (value: string | number, eq: string | number) => boolean;
    shorterThan: typeof shorterThan;
    shorterThanOrEquals: typeof shorterThanOrEquals;
    startsWith: typeof startsWith;
} & {
    allOf: typeof allOf;
    anyOf: typeof anyOf;
    noneOf: typeof noneOf;
    oneOf: typeof oneOf;
    optional: typeof optional;
} & {
    shape: typeof shape;
    loose: typeof loose;
    isArrayOf: typeof isArrayOf;
};
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare global {
    namespace n4s {
        interface EnforceCustomMatchers<R> {
        }
    }
}
type TRules<E = Record<string, unknown>> = n4s.EnforceCustomMatchers<TRules & E> & Record<string, (...args: TArgs) => TRules & E> & {
    [P in KCompounds]: (...args: DropFirst<Parameters<TCompounds[P]>> | TArgs) => TRules & E;
} & {
    [P in KBaseRules]: (...args: DropFirst<Parameters<TBaseRules[P]>> | TArgs) => TRules & E;
};
declare function enforceEager(value: TRuleValue): TRules;
type TEnforceEager = typeof enforceEager;
// Help needed improving the typings of this file.
// Ideally, we'd be able to extend TShapeObject, but that's not possible.
declare function partial<T extends Record<any, any>>(shapeObject: T): T;
declare function modifiers(): {
    partial: typeof partial;
};
type TModifiers = ReturnType<typeof modifiers>;
declare const enforce: TEnforce;
type TEnforce = TEnforceEager & TLazyRules & TEnforceMethods;
type TEnforceMethods = TModifiers & {
    context: () => TEnforceContext;
    extend: (customRules: TRule) => void;
};
/**
 * Reads the testObjects list and gets full validation result from it.
 */
declare function genTestsSummary(): TTestSummary;
type TTestSummary = {
    groups: Record<string, TTestGroup>;
    tests: TTestGroup;
} & TTestSummaryBase;
type TTestGroup = Record<string, TSingleTestSummary>;
type TSingleTestSummary = {
    errors: string[];
    warnings: string[];
} & TTestSummaryBase;
type TTestSummaryBase = {
    errorCount: number;
    warnCount: number;
    testCount: number;
};
declare function getErrors(): Record<string, string[]>;
declare function getErrors(fieldName?: string): string[];
declare function getWarnings(): Record<string, string[]>;
declare function getWarnings(fieldName?: string): string[];
declare function getErrorsByGroup(groupName: string): Record<string, string[]>;
declare function getErrorsByGroup(groupName: string, fieldName: string): string[];
declare function getWarningsByGroup(groupName: string): Record<string, string[]>;
declare function getWarningsByGroup(groupName: string, fieldName: string): string[];
declare function hasErrors(fieldName?: string): boolean;
declare function hasWarnings(fieldName?: string): boolean;
declare function hasErrorsByGroup(groupName: string, fieldName?: string): boolean;
declare function hasWarningsByGroup(groupName: string, fieldName?: string): boolean;
type TDraftResult = ReturnType<typeof genTestsSummary> & {
    /**
     * Returns whether the suite as a whole is valid.
     * Determined if there are no errors, and if no
     * required fields are skipped.
     */
    isValid: (fieldName?: string) => boolean;
    hasErrors: typeof hasErrors;
    hasWarnings: typeof hasWarnings;
    getErrors: typeof getErrors;
    getWarnings: typeof getWarnings;
    hasErrorsByGroup: typeof hasErrorsByGroup;
    hasWarningsByGroup: typeof hasWarningsByGroup;
    getErrorsByGroup: typeof getErrorsByGroup;
    getWarningsByGroup: typeof getWarningsByGroup;
};
type IVestResult = TDraftResult & {
    done: IDone;
};
interface IDone {
    (...args: [
        cb: (res: TDraftResult) => void
    ]): IVestResult;
    (...args: [
        fieldName: string,
        cb: (res: TDraftResult) => void
    ]): IVestResult;
}
type CreateProperties = {
    get: () => TDraftResult;
    reset: () => void;
    remove: (fieldName: string) => void;
};
type CB = (...args: any[]) => void;
type SuiteReturnType<T extends CB> = {
    (...args: Parameters<T>): IVestResult;
} & CreateProperties;
declare function create<T extends CB>(suiteName: string, suiteCallback: T): SuiteReturnType<T>;
declare function create<T extends CB>(suiteCallback: T): SuiteReturnType<T>;
declare class VestTest {
    fieldName: string;
    testFn: TTestFn;
    asyncTest?: TAsyncTest;
    groupName?: string;
    message?: string;
    id: string;
    warns: boolean;
    status: KStatus;
    constructor(fieldName: string, testFn: TTestFn, { message, groupName }?: {
        message?: string;
        groupName?: string;
    });
    run(): TTestResult;
    setStatus(status: KStatus): void;
    setPending(): void;
    fail(): void;
    done(): void;
    warn(): void;
    isFinalStatus(): boolean;
    skip(): void;
    cancel(): void;
    omit(): void;
    valueOf(): boolean;
    hasFailures(): boolean;
    isPending(): boolean;
    isTested(): boolean;
    isOmitted(): boolean;
    isUntested(): boolean;
    isFailing(): boolean;
    isCanceled(): boolean;
    isSkipped(): boolean;
    isPassing(): boolean;
    isWarning(): boolean;
}
type TAsyncTest = Promise<string | void>;
type TTestResult = TAsyncTest | boolean | void;
type TTestFn = () => TTestResult;
type KStatus = "UNTESTED" | "SKIPPED" | "FAILED" | "WARNING" | "PASSING" | "PENDING" | "CANCELED" | "OMITTED";
type TExclusionItem = string | string[] | undefined;
/**
 * Adds a field or multiple fields to inclusion group.
 */
declare function only(item: TExclusionItem): void;
declare namespace only {
    var group: (item: TExclusionItem) => void;
}
/**
 * Adds a field or multiple fields to exclusion group.
 */
declare function skip(item: TExclusionItem): void;
declare namespace skip {
    var group: (item: TExclusionItem) => void;
}
declare function skipWhen(conditional: boolean | ((draft: TDraftResult) => boolean), callback: (...args: any[]) => void): void;
/**
 * Sets a running test to warn only mode.
 */
declare function warn(): void;
/**
 * Runs a group callback.
 */
declare function group(groupName: string, tests: () => void): void;
declare function optional$0(optionals: TOptionalsInput): void;
type TOptionalsInput = string | string[] | TOptionalsObject;
type TOptionalsObject = Record<string, () => boolean>;
declare function testBase(fieldName: string, ...args: [
    message: string,
    cb: TTestFn
]): VestTest;
declare function testBase(fieldName: string, ...args: [
    cb: TTestFn
]): VestTest;
declare const _default: typeof testBase & {
    each: (table: any[]) => {
        (fieldName: TStringable, message: TStringable, cb: (...args: any[]) => TTestResult): VestTest[];
        (fieldName: TStringable, cb: (...args: any[]) => TTestResult): VestTest[];
    };
    memo: {
        (fieldName: string, test: TTestFn, deps: unknown[]): VestTest;
        (fieldName: string, message: string, test: TTestFn, deps: unknown[]): VestTest;
    };
};
declare const test: typeof _default;
declare const VERSION = "3.3.0";
export { test, create, only, skip, warn, group, optional$0 as optional, skipWhen, enforce, VERSION };
