const getInnerName = name => `__${name}`;
class Context {
  constructor({ use, set, addQueryableProperties, init }, ctxRef) {
    let _a;
    this._parentContext = null;
    const ctx = use();
    const usedRef =
      typeof init === 'function'
        ? (_a = init(ctxRef, ctx)) !== null && _a !== void 0
          ? _a
          : ctxRef
        : ctxRef;
    const queryableProperties = addQueryableProperties(usedRef);
    if (usedRef && typeof usedRef === 'object') {
      for (const key in queryableProperties) {
        if (Object.prototype.hasOwnProperty.call(usedRef, key)) {
          this[getInnerName(key)] = usedRef[key];
        }
        this.addLookupProperty(key);
      }
    }
    if (ctx) {
      this.setParentContext(ctx);
    }
    set(this);
  }
  static is(value) {
    return value instanceof Context;
  }
  addLookupProperty(key) {
    const innerName = getInnerName(key);
    Object.defineProperty(this, key, {
      get() {
        return this.lookup(innerName);
      },
      set(value) {
        throw new Error(
          `Context: Unable to set "${key}" to \`${JSON.stringify(
            value
          )}\`. context properties cannot be set directly. Use context.run() instead.`
        );
      },
    });
  }
  lookup(key) {
    let ctx = this;
    do {
      if (Object.prototype.hasOwnProperty.call(ctx, key)) {
        return ctx[key];
      }
      if (Context.is(ctx.parentContext)) {
        ctx = ctx.parentContext;
      } else {
        return;
      }
    } while (ctx);
  }
  setParentContext(parentContext) {
    if (Context.is(this)) {
      this._parentContext = parentContext;
    }
  }
  get parentContext() {
    return this._parentContext;
  }
}
const createContext = init => {
  const storage = {
    ctx: undefined,
  };
  const queryableProperties = {};
  const addQueryableProperties = ctxRef => {
    if (!ctxRef || typeof ctxRef !== 'object') {
      return {};
    }
    for (const key in ctxRef) {
      if (Object.prototype.hasOwnProperty.call(ctxRef, key)) {
        queryableProperties[key] = true;
      }
    }
    return queryableProperties;
  };
  const use = () => storage.ctx;
  const set = value => (storage.ctx = value);
  const clear = () => {
    const ctx = use();
    if (!Context.is(ctx)) {
      return;
    }
    set(ctx.parentContext);
  };
  const run = (ctxRef, fn) => {
    const ctx = new Context({ addQueryableProperties, init, set, use }, ctxRef);
    const res = fn(ctx);
    clear();
    return res;
  };
  return {
    use,
    run,
  };
};
export default createContext;
