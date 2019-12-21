import { singleton } from '../../lib';

/**
 * Creates a new context object, and assigns it as a static property on Vest's singleton.
 * @param {Object} parent   Parent context.
 */
function Context(parent) {
    singleton.use().ctx = this;
    Object.assign(this, parent);
}

/**
 * Sets a testObject reference on context.
 * @param {TestObject} A TestObject instance.
 */
Context.prototype.setCurrentTest = function(testObject) {
    this.currentTest = testObject;
};

/**
 * Removes current test from context.
 */
Context.prototype.removeCurrentTest = function() {
    delete this.currentTest;
};

/**
 * Clears stored instance from constructor function.
 */
Context.clear = function() {
    singleton.use().ctx = null;
};

export default Context;
