import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from '../../hooks/exclusive/constants';
import singleton from '../../lib/singleton';

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

  /**
   * Creates a new context object, and assigns it as a static property on Vest's singleton.
   * @param {Object} ctxRef   Context data reference.
   * @returns {Context} either an existing or a new context object.
   */
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

export default Context;
