export default function createContext<T extends Record<string, unknown>>(
  init?: (ctxRef: T, parentContext: T | void) => T | null
): {
  run: <R>(ctxRef: T, fn: (context: T) => R) => R;
  bind: <Fn extends (...args: any[]) => any>(ctxRef: T, fn: Fn) => Fn;
  use: () => T | undefined;
} {
  const storage: { ctx?: T; ancestry: T[] } = { ancestry: [] };

  return {
    run,
    bind,
    use,
  };

  function run<R>(ctxRef: T, fn: (context: T) => R): R {
    const parentContext = use();

    const out = {
      ...(parentContext ? parentContext : {}),
      ...(init?.(ctxRef, parentContext) ?? ctxRef),
    };

    const ctx = set(Object.freeze(out));
    storage.ancestry.unshift(ctx);
    const res = fn(ctx);

    clear();
    return res;
  }

  function bind<Fn extends (...args: any[]) => any>(ctxRef: T, fn: Fn) {
    // @ts-ignore - this one's pretty hard to get
    const returnedFn: Fn = function (...runTimeArgs: Parameters<Fn>) {
      return run<ReturnType<Fn>>(ctxRef, function () {
        return fn(...runTimeArgs);
      });
    };

    return returnedFn;
  }

  function use() {
    return storage.ctx;
  }

  function set(value: T): T {
    return (storage.ctx = value);
  }

  function clear() {
    storage.ancestry.shift();
    set(storage.ancestry[0] ?? null);
  }
}
