import Context from '../../../Context';

class TestObject {

    failed: boolean;
    ctx?: Context;
    isWarning: boolean;
    fieldName: string;
    statement?: string;
    testFn: Function;
    asyncTest: Promise<any>;

    /**
     * Describes a test call inside a Vest suite.
     */
    constructor(ctx: Context,
        fieldName: string,
        statement: string,
        testFn: Function
    ) {
        Object.assign(this, {
            ctx,
            testFn,
            fieldName,
            statement,
            isWarning: false,
            failed: false
        });
    }

    /**
    * Current validity status of a test.
    */
    valueOf(): boolean {
        return this.failed !== true;
    }

    /**
     * Sets a test to failed.
     */
    fail(): TestObject {
        this.ctx.result.markFailure({
            fieldName: this.fieldName,
            statement: this.statement,
            isWarning: this.isWarning
        });

        this.failed = true;
        return this;
    }

    /*
     * Sets a current test's `isWarning` to true.
     */
    warn() {
        this.isWarning = true;
        return this;
    }
}

export default TestObject;
