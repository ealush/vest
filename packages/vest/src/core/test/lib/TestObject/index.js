/**
 * Describes a test call inside a Vest suite.
 * @param {Object} ctx                  Parent context.
 * @param {String} fieldName            Name of the field being tested.
 * @param {String} statement            The message returned when failing.
 * @param {Promise|Function} testFn     The actual test callbrack or promise.
 */
function TestObject(ctx, fieldName, statement, testFn) {
  Object.assign(this, {
    ctx,
    testFn,
    fieldName,
    statement,
    isWarning: false,
    failed: false,
  });
}

/**
 * @returns {Boolean} Current validity status of a test.
 */
TestObject.prototype.valueOf = function () {
  return this.failed !== true;
};

/**
 * Sets a test to failed.
 * @returns {TestObject} Current instance.
 */
TestObject.prototype.fail = function () {
  this.ctx.result.markFailure({
    fieldName: this.fieldName,
    statement: this.statement,
    isWarning: this.isWarning,
  });

  this.failed = true;
  return this;
};

/**
 * Sets a current test's `isWarning` to true.
 * @returns {TestObject} Current instance.
 */
TestObject.prototype.warn = function () {
  this.isWarning = true;
  return this;
};

export default TestObject;
