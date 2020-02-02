import { isExcluded } from '../../hooks/exclusive';
import { singleton } from '../../lib';
import { TestObject } from './lib';

/**
 * Runs async test.
 * @param {TestObject} testObject A TestObject instance.
 */
export const runAsync = (testObject) => {
    const { testFn, statement, ctx } = testObject;

    const done = () => ctx.result.markAsDone(testObject);

    const fail = (rejectionMessage) => {
        testObject.statement = typeof rejectionMessage === 'string'
            ? rejectionMessage
            : statement;

        testObject.fail();

        done();
    };

    ctx.setCurrentTest(testObject);

    try {
        testFn.then(done, fail);
    } catch (e) {
        // @ts-ignore
        fail();
    }

    ctx.removeCurrentTest();
};

/**
 * Runs test callback.
 * @param {TestObject} testObject TestObject instance.
 * @returns {*} Result from test callback.
 */
const runTest = (testObject) => {
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
 * @param {TestObject} testObject   A TestObject Instance.
 */
const register = (testObject) => {
    const { testFn, ctx, fieldName } = testObject;
    let isPending = false;
    let result;

    if (isExcluded(fieldName)) {
        ctx.result.addToSkipped(fieldName);
        return;
    }

    ctx.result.markTestRun(fieldName);

    if (testFn && typeof testFn.then === 'function') {
        isPending = true;
    } else {
        result = runTest(testObject);
    }

    if (result && typeof result.then === 'function') {
        isPending = true;

        testObject.testFn = result;
    }

    if (isPending) {
        ctx.result.setPending(testObject);
    }
};

/**
 * Test function used by consumer to provide their own validations.
 * @param {String} fieldName            Name of the field to test.
 * @param {String} [statement]          The message returned in case of a failure.
 * @param {function} testFn             The actual test callback.
 * @return {TestObject}                 A TestObject instance.
 */
const test = (fieldName, ...args) => {
    let statement,
        testFn;

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
