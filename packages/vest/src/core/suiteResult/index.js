const suiteResult = (name) => {
  const pending = { tests: [] };
  const doneCallbacks = [];
  const fieldCallbacks = {};
  let isAsync = false;

  /**
   * Adds a testObject to pending list.
   * @param {Object} testObject
   */
  const setPending = (testObject) => {
    isAsync = true;
    pending.tests.push(testObject);
  };

  /**
   * Clears a testObject from pending list.
   * @param {Object} testObject
   */
  const clearFromPending = (testObject) => {
    pending.tests = pending.tests.filter((t) => t !== testObject);
  };

  /**
   * Checks if a specified field has any remaining tests.
   * @param {String} fieldName
   * @returns {Boolean}
   */
  const hasRemaining = (fieldName) => {
    if (!pending.tests.length) {
      return false;
    }

    if (fieldName) {
      return pending.tests.some(
        (testObject) => testObject.fieldName === fieldName
      );
    }

    return !!pending.tests.length;
  };

  /**
   * Bumps test counters to indicate tests that are being performed
   * @param {string} fieldName - The name of the field.
   */
  const markTestRun = (fieldName) => {
    if (!output.tests[fieldName]) {
      output.tests[fieldName] = {
        testCount: 0,
        errorCount: 0,
        warnCount: 0,
      };

      output.tested.push(fieldName);
    }

    output.tests[fieldName].testCount++;
    output.testCount++;
  };

  /**
   * Marks a test as failed.
   * @param {Object} testData
   * @param {String} testData.fieldName       Name of field being tested.
   * @param {String} [testData.statement]     Failure message to display.
   * @param {Boolean} [testData.isWarning]    Indicates warn only test.
   */
  const markFailure = ({ fieldName, statement, isWarning }) => {
    if (!output.tests[fieldName]) {
      return;
    }

    let severityGroup, severityCount;

    if (isWarning) {
      severityGroup = "warnings";
      severityCount = "warnCount";
    } else {
      severityGroup = "errors";
      severityCount = "errorCount";
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
   * @param {string} fieldName - The name of the field.
   */
  const addToSkipped = (fieldName) => {
    !output.skipped.includes(fieldName) && output.skipped.push(fieldName);
  };

  /**
   * Runs callbacks of specified field, or of the whole suite.
   * @param {String} [fieldName]
   */
  const runCallbacks = (fieldName) => {
    if (!fieldName) {
      return doneCallbacks.forEach((cb) => cb(output));
    }

    if (Array.isArray(fieldCallbacks[fieldName])) {
      return fieldCallbacks[fieldName].forEach((cb) => cb(output));
    }
  };

  /**
   * Removes a field from pending, and runs its callbacks. If all fields are done, runs all callbacks.
   * @param {Object} testObject a testObject to remove from pending.
   */
  const markAsDone = (testObject) => {
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

  /**
   * Registers a callback to run once the suite or a specified field finished running.
   * @param {String} [name] Name of the field to call back after,
   * @param {Function} callback A callback to run once validation is finished.
   * @returns {Object} Output object.
   */
  const done = (...args) => {
    const { length, [length - 1]: callback, [length - 2]: name } = args;

    if (typeof callback !== "function") {
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
  const cancel = () => {
    output.canceled = true;

    return output;
  };

  /**
   * Collects all fields that have an array of specified group in their results.
   * @param {String} group Group name (warnings or errors).
   * @returns {Object} Object of array per field.
   */
  const collectFailureMessages = (group) => {
    const collector = {};

    for (const fieldName in output.tests) {
      if (output.tests[fieldName] && output.tests[fieldName][group]) {
        collector[fieldName] = output.tests[fieldName][group];
      }
    }

    return collector;
  };

  /**
   * Gets all the errors of a field, or of the whole object.
   * @param {string} fieldName - The name of the field.
   * @return {array | object} The field's errors, or all errors.
   */
  const getErrors = (fieldName) => {
    if (!fieldName) {
      return collectFailureMessages("errors");
    }

    return output.tests?.[fieldName]?.errors || [];
  };

  /**
   * Gets all the warnings of a field, or of the whole object.
   * @param {string} [fieldName] - The name of the field.
   * @return {array | object} The field's warnings, or all warnings.
   */
  const getWarnings = (fieldName) => {
    if (!fieldName) {
      return collectFailureMessages("warnings");
    }

    return output.tests?.[fieldName]?.warnings || [];
  };

  /**
   * Checks if a certain field (or the whole suite) has errors.
   * @param {string} [fieldName]
   * @return {boolean}
   */
  const hasErrors = (fieldName) => {
    if (!fieldName) {
      return !!output.errorCount;
    }

    return Boolean(output.tests?.[fieldName]?.errorCount);
  };

  /**
   * Checks if a certain field (or the whole suite) has warnings
   * @param {string} [fieldName]
   * @return {boolean}
   */
  const hasWarnings = (fieldName) => {
    if (!fieldName) {
      return !!output.warnCount;
    }

    return Boolean(output.tests?.[fieldName]?.warnCount);
  };

  const output = {
    name,
    errorCount: 0,
    warnCount: 0,
    testCount: 0,
    tests: {},
    skipped: [],
    tested: [],
  };

  Object.defineProperties(output, {
    hasErrors: {
      value: hasErrors,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    hasWarnings: {
      value: hasWarnings,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    getErrors: {
      value: getErrors,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    getWarnings: {
      value: getWarnings,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    done: {
      value: done,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    cancel: {
      value: cancel,
      writable: true,
      configurable: true,
      enumerable: false,
    },
  });

  return {
    markTestRun,
    markFailure,
    setPending,
    addToSkipped,
    markAsDone,
    pending: pending.tests,
    output,
  };
};

export default suiteResult;
