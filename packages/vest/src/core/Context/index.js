import singleton from '../../lib/singleton';

/**
 * Creates a new context object, and assigns it as a static property on Vest's singleton.
 * @param {Object} parent   Parent context.
 * @returns {Context} either an existing or a new context object.
 */
function Context(parent) {
  if (singleton.use().ctx) {
    return Object.assign(singleton.use().ctx, parent);
  }

  singleton.use().ctx = this;
  Object.assign(this, parent);
  return this;
}

/**
 * Sets a testObject reference on context.
 * @param {VestTest} A VestTest instance.
 */
Context.prototype.setCurrentTest = function (testObject) {
  this.currentTest = testObject;
};

/**
 * Removes current test from context.
 */
Context.prototype.removeCurrentTest = function () {
  delete this.currentTest;
};

/**
 * Clears stored instance from constructor function.
 */
Context.clear = function () {
  singleton.use().ctx = null;
};

export default Context;
