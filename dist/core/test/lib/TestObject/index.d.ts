import Context from '../../../Context';
declare class TestObject {
    failed: boolean;
    ctx?: Context;
    isWarning: boolean;
    fieldName: string;
    statement?: string;
    testFn: Function;
    asyncTest: Promise<any>;
    constructor(ctx: Context, fieldName: string, statement: string, testFn: Function);
    valueOf(): boolean;
    fail(): TestObject;
    warn(): this;
}
export default TestObject;
