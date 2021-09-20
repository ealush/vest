import assign from 'assign';
import defaultTo from 'defaultTo';
import throwError from 'throwError';

// eslint-disable-next-line max-lines-per-function
export function createContext<T extends Record<string, unknown>>(
  init?: (ctxRef: Partial<T>, parentContext: T | void) => T | null
): {
  run: <R>(ctxRef: Partial<T>, fn: (context: T) => R) => R;
  bind: <Fn extends (...args: any[]) => any>(ctxRef: Partial<T>, fn: Fn) => Fn;
  use: () => T | undefined;
  useX: (errorMessage?: string) => T;
} {
  const storage: { ctx?: T; ancestry: T[] } = { ancestry: [] };

  return {
    bind,
    run,
    use,
    useX,
  };

  function useX(errorMessage?: string): T {
    return (
      (storage.ctx as T) ??
      throwError(
        defaultTo(errorMessage, 'Context was used after it was closed')
      )
    );
  }

  function run<R>(ctxRef: Partial<T>, fn: (context: T) => R): R {
    const parentContext = use();

    const out = assign(
      {},
      parentContext ? parentContext : {},
      init?.(ctxRef, parentContext) ?? ctxRef
    ) as T;

    const ctx = set(Object.freeze(out));
    storage.ancestry.unshift(ctx);
    const res = fn(ctx);

    clear();
    return res;
  }

  function bind<Fn extends (...args: any[]) => any>(
    ctxRef: Partial<T>,
    fn: Fn
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - this one's pretty hard to get right
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
