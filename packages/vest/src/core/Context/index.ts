import singleton from '../../lib/singleton';

import type { VestTestType } from '../test/lib/VestTest';
import type { OperationMode } from '../../constants';
class Context {
  current_test?: VestTestType;
  name: string;
  suite_id: string;
  group_name: string;
  parentContext: Context;
  childContext: Context;
  operationMode?: OperationMode;

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
   */
  constructor(ctxRef: Object) {
    const ctx: Context = singleton.useContext();
    Object.assign(this, ctxRef);

    if (ctx) {
      ctx.setChildContext(this);
    }

    singleton.use().ctx = this;
  }

  get suiteId() {
    return this.lookup('suite_id');
  }

  set suiteId(suiteId: string) {
    this.suite_id = suiteId;
  }

  get currentTest() {
    return this.lookup('current_test');
  }

  set currentTest(testObject: VestTestType) {
    this.current_test = testObject;
  }

  get groupName() {
    return this.lookup('group_name');
  }

  set groupName(groupName: string) {
    this.group_name = groupName;
  }

  lookup<T extends keyof Context>(key: T): Context[T] {
    let ctx: Context = this;
    do {
      if (ctx[key]) {
        return ctx[key];
      }
      ctx = ctx.parentContext;
    } while (ctx);
  }

  setParentContext(parentContext: Context) {
    this.parentContext = parentContext;
  }

  setChildContext(childContext: Context) {
    childContext.parentContext = this;
    this.childContext = childContext;
  }

  removeChildContext() {
    this.childContext = null;
  }
}

export default Context;
export type ContextType = Context;
