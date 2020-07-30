import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from '../../hooks/exclusive/constants';

class Context {
  /**
   * Creates a new context object.
   * @param {Object} ctxRef   Context data reference.
   * @returns {Context} either an existing or a new context object.
   */
  constructor(ctxRef) {
    const ctx = Context.use();
    Object.assign(this, ctxRef);

    if (ctx) {
      ctx.setChildContext(this);
    }

    Context.set(this);
  }

  get suiteId() {
    return this.lookup('suite_id');
  }

  set suiteId(suiteId) {
    this.suite_id = suiteId;
  }

  get currentTest() {
    return this.lookup('current_test');
  }

  set currentTest(testObject) {
    this.current_test = testObject;
  }

  get groupName() {
    return this.lookup('group_name');
  }

  set groupName(groupName) {
    this.group_name = groupName;
  }

  get exclusion() {
    let key = this.lookup('_exclusion');

    if (key === undefined) {
      key = this._exclusion = {
        [EXCLUSION_ITEM_TYPE_TESTS]: {},
        [EXCLUSION_ITEM_TYPE_GROUPS]: {},
      };
    }

    return key;
  }

  lookup(key) {
    let ctx = this;
    do {
      if (ctx[key]) {
        return ctx[key];
      }
      ctx = ctx.parentContext;
    } while (ctx);
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
}

/**
 * Assign static functions onto Context
 * These functions tap into the closure
 */
export default Object.assign(
  Context,
  (() => {
    const storage = {};

    /**
     * @returns Vest's context;
     */
    const use = () => storage.ctx;

    /**
     * Sets the shared context.
     * @param {string} key
     * @param {*} value
     */
    const set = value => (storage.ctx = value);

    /**
     * Clears stored instance from constructor function.
     */
    const clear = () => {
      const ctx = use();
      if (ctx?.parentContext) {
        set(ctx.parentContext);
        ctx.parentContext.removeChildContext();
      } else {
        set(null);
      }
    };

    return { use, set, clear };
  })()
);
