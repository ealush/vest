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
declare const promisify: (validatorFn: (...args: any[]) => IVestResult) => (...args: any[]) => Promise<TDraftResult>;
export { promisify as default };
