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
type TLazyRuleMethods = {
    test: (value: unknown) => boolean;
    run: (value: unknown) => TRuleDetailedResult;
};
declare namespace compounds {
    type TRuleReturn = boolean | {
        pass: boolean;
        message?: string | (() => string);
    };
    type TRuleDetailedResult = {
        pass: boolean;
        message?: string;
    };
    type TLazyRuleMethods = {
        test: (value: unknown) => boolean;
        run: (value: unknown) => TRuleDetailedResult;
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
declare function isNaN(value: any): boolean;
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
    isEven: (value: any) => boolean;
    isFalsy: (value: unknown) => boolean;
    isNaN: typeof isNaN;
    isNegative: typeof isNegative;
    isNotArray: (value: unknown) => boolean;
    isNotBetween: (value: string | number, min: string | number, max: string | number) => boolean;
    isNotBoolean: (value: unknown) => boolean;
    isNotEmpty: (value: unknown) => boolean;
    isNotNaN: (value: any) => boolean;
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
    isValid: () => boolean;
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
declare function create<T extends (...args: any[]) => void>(suiteCallback: T): {
    (...args: Parameters<T>): IVestResult;
    get: () => TDraftResult;
    reset: () => void;
    remove: (fieldName: string) => void;
    subscribe: (handler: () => void) => void;
};
type TAsyncTest = Promise<string | void>;
type TTestResult = TAsyncTest | boolean | void;
type TTestFn = () => TTestResult;
declare class VestTest {
    fieldName: string;
    testFn: TTestFn;
    asyncTest?: TAsyncTest;
    groupName?: string;
    message?: string;
    id: string;
    failed: boolean;
    isWarning: boolean;
    canceled: boolean;
    constructor(fieldName: string, testFn: TTestFn, { message, groupName }?: {
        message?: string;
        groupName?: string;
    });
    run(): TTestResult;
    fail(): void;
    warn(): void;
    cancel(): void;
    valueOf(): boolean;
}
type TExclusionItemType = string | string[] | undefined;
/**
 * Adds a field or multiple fields to inclusion group.
 */
declare function only(item: TExclusionItemType): void;
declare namespace only {
    var group: (item: TExclusionItemType) => void;
}
/**
 * Adds a field or multiple fields to exclusion group.
 * @param {String[]|String} item Item to be added to exclusion group.
 */
declare function skip(item: TExclusionItemType): void;
declare namespace skip {
    var group: (item: TExclusionItemType) => void;
}
/**
 * Sets a running test to warn only mode.
 */
declare function warn(): void;
/**
 * Runs a group callback.
 */
declare function group(groupName: string, tests: () => any): void;
declare function optional(optionals: string | string[]): void;
declare function testBase(fieldName: string, ...args: [
    message: string,
    cb: TTestFn
]): VestTest;
declare function testBase(fieldName: string, ...args: [
    cb: TTestFn
]): VestTest;
declare const _default: typeof testBase & {
    each: (table: any[]) => {
        (fieldName: string | ((...args: any[]) => string), message: string | ((...args: any[]) => string), cb: (...args: any[]) => TTestResult): VestTest[];
        (fieldName: string | ((...args: any[]) => string), cb: (...args: any[]) => TTestResult): VestTest[];
    };
    memo: {
        (fieldName: string, test: TTestFn, deps: unknown[]): VestTest;
        (fieldName: string, fieldName: string, test: TTestFn, deps: unknown[]): VestTest;
    };
};
declare const test: typeof _default;
declare const VERSION = "1.0.31";
export { test, create, only, skip, warn, group, optional, enforce, VERSION };
//# sourceMappingURL=vest.d.ts.map