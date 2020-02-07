import TestObject from '../test/lib/TestObject';
export declare type SuiteResultType = ReturnType<typeof suiteResult>;
export declare type VestOutput = SuiteResultType['output'];
declare const suiteResult: (name: string) => {
    markTestRun: (fieldName: string) => void;
    markFailure: ({ fieldName, statement, isWarning }: {
        fieldName: string;
        statement?: string;
        isWarning?: boolean;
    }) => void;
    setPending: (testObject: TestObject) => void;
    addToSkipped: (fieldName: string) => void;
    markAsDone: (testObject: TestObject) => void;
    pending: any[];
    output: {
        name: string;
        errorCount: number;
        warnCount: number;
        testCount: number;
        tests: {};
        skipped: any[];
        tested: any[];
        canceled: boolean;
    };
};
export default suiteResult;
