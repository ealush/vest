import { isExcluded } from '../../hooks/exclusive';
import { singleton } from '../../lib';
import { TestObject } from './lib';

/**
 * Runs async test.
 */
export const runAsync = (testObject: TestObject) => {
    const { asyncTest, statement, ctx } = testObject;

    const done = () => ctx.result.markAsDone(testObject);

    const fail = (rejectionMessage?: string) => {
        testObject.statement = typeof rejectionMessage === 'string'
            ? rejectionMessage
            : statement;

        testObject.fail();

        done();
    };

    ctx.setCurrentTest(testObject);

    try {
        asyncTest.then(done, fail);
    } catch (e) {
        fail();
    }

    ctx.removeCurrentTest();
};

/**
 * Runs test callback.
 */
const runTest = (testObject: TestObject): any => {
    let result;

    testObject.ctx.setCurrentTest(testObject);

    try {
        result = testObject.testFn.apply(testObject);
    } catch (e) {
        result = false;
    }

    testObject.ctx.removeCurrentTest();

    if (result === false) {
        testObject.fail();
    }

    return result;
};

/**
 * Registers test, if async - adds to pending array
 */
const register = (testObject: TestObject) => {
    const { ctx, fieldName } = testObject;
    let isPending = false;
    let result;

    if (isExcluded(fieldName)) {
        ctx.result.addToSkipped(fieldName);
        return;
    }

    ctx.result.markTestRun(fieldName);

    result = runTest(testObject);

    if (result && typeof result.then === 'function') {
        isPending = true;

        testObject.asyncTest = result;
    }

    if (isPending) {
        ctx.result.setPending(testObject);
    }
};

/**
 * Test function used by consumer to provide their own validations.
 */
const test = (fieldName: string, ...args: [string, Function]|[Function]): TestObject => {
    let statement: string,
        testFn: Function;

    if (typeof args[0] === 'string') {
        [statement, testFn] = args;
    } else if (typeof args[0] === 'function') {
        [testFn] = args;
    }

    if (typeof testFn !== 'function') {
        return;
    }

    const testObject = new TestObject(
        singleton.useContext(),
        fieldName,
        statement,
        testFn
    );

    register(testObject);

    return testObject;
};

export default test;
