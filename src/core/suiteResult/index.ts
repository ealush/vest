import TestObject from '../test/lib/TestObject';

type errorsReturn = string[] | {
    [fieldName: string]: string[]
};

export type SuiteResultType = ReturnType<typeof suiteResult>;
export type VestOutput = SuiteResultType['output'];

const suiteResult = (name: string) => {
    const pending = { tests: [] };
    const doneCallbacks = [];
    const fieldCallbacks = {};
    let isAsync = false;

    /**
     * Adds a testObject to pending list.
     */
    const setPending = (testObject: TestObject) => {
        isAsync = true;
        pending.tests.push(testObject);
    };

    /**
     * Clears a testObject from pending list.
     */
    const clearFromPending = (testObject: TestObject) => {
        pending.tests = pending.tests
            .filter((t) => t !== testObject);
    };

    /**
     * Checks if a specified field has any remaining tests.
     */
    const hasRemaining = (fieldName?: string): boolean => {
        if (!pending.tests.length) {
            return false;
        }

        if (fieldName) {
            return pending.tests
                .some((testObject) => testObject.fieldName === fieldName);
        }

        return !!pending.tests.length;
    };

    /**
     * Bumps test counters to indicate tests that are being performed
     */
    const markTestRun = (fieldName: string) => {

        if (!output.tests[fieldName]) {
            output.tests[fieldName] = {
                testCount: 0,
                errorCount: 0,
                warnCount: 0
            };

            output.tested.push(fieldName);
        }

        output.tests[fieldName].testCount++;
        output.testCount++;
    };

    /**
     * Marks a test as failed.
     */
    const markFailure = ({ fieldName, statement, isWarning }: {
        fieldName: string;
        statement?: string;
        isWarning?: boolean;
    }) => {
        if (!output.tests[fieldName]) { return; }

        let severityGroup, severityCount;

        if (isWarning) {
            severityGroup = 'warnings';
            severityCount = 'warnCount';
        } else {
            severityGroup = 'errors';
            severityCount = 'errorCount';
        }

        output.tests[fieldName][severityGroup] =
            output.tests[fieldName][severityGroup] || [];

        if (statement) {
            output.tests[fieldName][severityGroup].push(statement);
        }

        output[severityCount]++;
        output.tests[fieldName][severityCount]++;
    };

    /**
     * Uniquely add a field to the `skipped` list
     */
    const addToSkipped = (fieldName: string) => {
        !output.skipped.includes(fieldName) && output.skipped.push(fieldName);
    };

    /**
     * Runs callbacks of specified field, or of the whole suite.
     */
    const runCallbacks = (fieldName?: string) => {
        if (!fieldName) {
            return doneCallbacks.forEach((cb) => cb(output));
        }

        if (Array.isArray(fieldCallbacks[fieldName])) {
            return fieldCallbacks[fieldName].forEach((cb) => cb(output));
        }
    };

    /**
     * Removes a field from pending, and runs its callbacks. If all fields are done, runs all callbacks.
     */
    const markAsDone = (testObject: TestObject) => {

        if (output.canceled) {
            return;
        }

        if (testObject) {
            clearFromPending(testObject);
            if (!hasRemaining(testObject.fieldName)) {
                runCallbacks(testObject.fieldName);
            }
        }

        if (!hasRemaining()) {

            runCallbacks();
        }
    };

    type DoneCallback = (vestOutput: typeof output) => void;

    /**
     * Registers a callback to run once the suite or a specified field finished running.
     */
    const done = (...args: [string, DoneCallback]|[DoneCallback]): typeof output => {
        let name: string,
            callback: DoneCallback;

        if (typeof args[0] === 'string') {
            [name, callback] = args;
        } else if (typeof args[0] === 'function') {
            [callback] = args;
        }

        if (typeof callback !== 'function') {
            return output;
        }

        if (!isAsync) {
            callback(output);
            return output;
        }

        if (name && !hasRemaining(name)) {
            callback(output);
            return output;
        }

        if (name) {
            fieldCallbacks[name] = fieldCallbacks[name] || [];
            fieldCallbacks[name].push(callback);
        } else {
            doneCallbacks.push(callback);
        }

        return output;
    };

    /**
     * cancels done callbacks. They won't invoke when async operations complete
     */
    const cancel = (): typeof output => {
        output.canceled = true;

        return output;
    };

    /**
     * Collects all fields that have an array of specified group in their results.
     */
    const collectFailureMessages = (group: string): {
        [fieldName: string]: string[];
    } => {
        const collector = {};

        for (const fieldName in output.tests) {
            if (output.tests[fieldName] &&
                output.tests[fieldName][group]) {
                collector[fieldName] = output.tests[fieldName][group];
            }
        }

        return collector;
    };

    /**
     * Gets all the errors of a field, or of the whole object.
     */
    const getErrors = (fieldName?: string): errorsReturn => {
        if (!fieldName) {
            return collectFailureMessages('errors');
        }

        if (output.tests[fieldName].errors) {
            return output.tests[fieldName].errors;
        }

        return [];
    };

    /**
     * Gets all the warnings of a field, or of the whole object.
     */
    const getWarnings = (fieldName?: string): errorsReturn => {
        if (!fieldName) {
            return collectFailureMessages('warnings');
        }

        if (output.tests[fieldName].warnings) {
            return output.tests[fieldName].warnings;
        }

        return [];
    };

    /**
     * Checks if a certain field (or the whole suite) has errors.
     */
    const hasErrors = (fieldName?: string): boolean => {
        if (!fieldName) {
            return !!output.errorCount;
        }

        return Boolean(
            output.tests[fieldName] &&
            output.tests[fieldName].errorCount
        );
    };

    /**
     * Checks if a certain field (or the whole suite) has warnings
     */
    const hasWarnings = (fieldName?: string): boolean => {
        if (!fieldName) {
            return !!output.warnCount;
        }

        return Boolean(
            output.tests[fieldName] &&
            output.tests[fieldName].warnCount
        );
    };

    const output = {
        name,
        errorCount: 0,
        warnCount: 0,
        testCount: 0,
        tests: {},
        skipped: [],
        tested: [],
        canceled: false
    };

    Object.defineProperties(output, {
        hasErrors: {
            value: hasErrors,
            writable: true,
            configurable: true,
            enumerable: false
        },
        hasWarnings: {
            value: hasWarnings,
            writable: true,
            configurable: true,
            enumerable: false
        },
        getErrors: {
            value: getErrors,
            writable: true,
            configurable: true,
            enumerable: false
        },
        getWarnings: {
            value: getWarnings,
            writable: true,
            configurable: true,
            enumerable: false
        },
        done: {
            value: done,
            writable: true,
            configurable: true,
            enumerable: false
        },
        cancel: {
            value: cancel,
            writable: true,
            configurable: true,
            enumerable: false
        }
    });

    return {
        markTestRun,
        markFailure,
        setPending,
        addToSkipped,
        markAsDone,
        pending: pending.tests,
        output
    };
};

export default suiteResult;
