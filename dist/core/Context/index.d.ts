import { SuiteResultType } from '../suiteResult';
declare class Context {
    result?: SuiteResultType;
    exclusive: {
        skip?: {
            [fieldName: string]: true;
        };
        only?: {
            [fieldName: string]: true;
        };
    };
    currentTest?: {
        warn?: Function;
    };
    static clear(): void;
    constructor(parent: any);
    setCurrentTest(testObject: any): void;
    removeCurrentTest(): void;
}
export default Context;
