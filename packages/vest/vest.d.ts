type enforce = (value: any) => EnforceRules;

type Enforce = (customRules: {
    [ruleName: string]: (enforcedValue: any, ...args: any[]) => boolean;
}) => enforce;

interface EnforceRules {
    equals(value: any): EnforceRules;
    notEquals(value: any): EnforceRules;
    isEmpty(): EnforceRules;
    isNotEmpty(): EnforceRules;
    isNumeric(): EnforceRules;
    isNotNumeric(): EnforceRules;
    greaterThan(number: number|string): EnforceRules;
    greaterThanOrEquals(number: number|string): EnforceRules;
    lengthEquals(number: number|string): EnforceRules;
    lengthNotEquals(number: number|string): EnforceRules;
    lessThan(number: number|string): EnforceRules;
    lessThanOrEquals(number: number|string): EnforceRules;
    longerThan(value: string|array): EnforceRules;
    longerThanOrEquals(value: string|array): EnforceRules;
    numberEquals(value: string|array): EnforceRules;
    numberNotEquals(value: string|array): EnforceRules;
    shorterThan(value: string|array): EnforceRules;
    shorterThanOrEquals(value: string|array): EnforceRules;
    matches(matcher: RegExp|string): EnforceRules;
    notMatches(matcher: RegExp|string): EnforceRules;
    inside(value: string|array): EnforceRules;
    notInside(value: string|array): EnforceRules;
    isTruthy(): EnforceRules;
    isFalsy(): EnforceRules;
    isArray(): EnforceRules;
    isNotArray(): EnforceRules;
    isNumber(): EnforceRules;
    isNotNumber(): EnforceRules;
    isString(): EnforceRules;
    isNotString(): EnforceRules;
    isOdd(): EnforceRules;
    isEven(): () => EnforceRules;
}

type VestOutput = {
    name: string;
    errorCount: number;
    warnCount: number;
    testCount: number;
    skipped: string[];
    tested: string[];
    tests: {
        [fieldName: string]: {
            errorCount: number;
            errors?: string[];
            warnCount: number;
            warnings?: string[];
            testCount: number;
        }
    };
    canceled: boolean;
    hasErrors: (fieldName?: string) => VestOutput;
    hasWarnings: (fieldName?: string) => VestOutput;
    getErrors: (fieldName?: string) => VestOutput;
    getWarnings: (fieldName?: string) => VestOutput;
    done: (fieldName?: string, cb: (output: VestOutput) => void) => VestOutput;
    cancel: () => VestOutput;
}

interface TestObject {
    fieldName: string;
    statement?: string;
    isWarning: Boolean;
    failed: Boolean;
    testFn: Function;
}

declare module 'vest' {
    const VERSION: string;
    const validate: (name: string, tests: Function) => VestOutput;
    const test: (fieldName: string, statement?: string, cb: Function) => TestObject;
    const any: (...args:any[]) => boolean;
    const only: (item: string|string[]) => void;
    const skip: (item: string|string[]) => void;
    const warn: () => void;
    const draft: () => VestOutput;
    const Enforce: Enforce;
    const enforce: enforce;

    export {
        VERSION,
        validate,
        test,
        any,
        only,
        skip,
        warn,
        draft,
        Enforce,
        enforce,
    }
}


