import singleton from '../../lib/singleton';

/**
 * Creates a new context object, and assigns it as a static property on Vest's singleton.
 * @param {Object} parent   Parent context.
 * @returns {Context} either an existing or a new context object.
 */

class Context {
  /**
   * Clears stored instance from constructor function.
   */
  static clear() {
    const ctx = singleton.useContext();

    if (ctx?.parentContext) {
      singleton.use().ctx = ctx.parentContext;
      ctx.parentContext.removeChildContext();
    } else {
      singleton.use().ctx = null;
    }
  }

  constructor(ctxRef) {
    const ctx = singleton.useContext();
    Object.assign(this, ctxRef);

    if (ctx) {
      ctx.setChildContext(this);
    }

    singleton.use().ctx = this;
  }

  get suiteId() {
    return this.lookup('suite_id');
  }

  set suiteId(suiteId) {
    this.suite_id = suiteId;
  }

  lookup(key) {
    let ctx = this;
    do {
      if (ctx[key]) {
        return ctx[key];
      }
      ctx = ctx.parentContext;
    } while (ctx || ctx?.parentContext);
  }

  setParentContext(parentContext) {
    this.parentContext = parentContext;
  }

  setChildContext(childContext) {
    childContext.parentContext = this;
    this.childContext = childContext;
  }

  removeChildContext() {
    this.childContext = null;
  }

  /**
   * Sets a testObject reference on context.
   * @param {VestTest} A VestTest instance.
   */
  setCurrentTest(testObject) {
    this.currentTest = testObject;
  }

  /**
   * Removes current test from context.
   */
  removeCurrentTest() {
    delete this.currentTest;
  }
}

export default Context;
