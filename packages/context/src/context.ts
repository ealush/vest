import { CB } from 'utilityTypes';
import {
  assign,
  defaultTo,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

// eslint-disable-next-line max-lines-per-function
export function createContext<T extends Record<string, unknown>>(
  init?: (ctxRef: Partial<T>, parentContext: T | void) => T | null
): {
  run: <R>(ctxRef: Partial<T>, fn: (context: T) => R) => R;
  bind: <Fn extends CB>(ctxRef: Partial<T>, fn: Fn) => Fn;
  use: () => T | undefined;
  useX: (errorMessage?: string) => T;
} {
  const storage: { ctx?: T } = {};

  return {
    bind,
    run,
    use,
    useX,
  };

  function useX(errorMessage?: string): T {
    const ctx = use();
    invariant(
      ctx,
      defaultTo(errorMessage, 'Context was used after it was closed')
    );
    return ctx;
  }

  function run<R>(ctxRef: Partial<T>, fn: (context: T) => R): R {
    const parentContext = use();

    const out = assign(
      {},
      parentContext ? parentContext : {},
      optionalFunctionValue(init, ctxRef, parentContext) ?? ctxRef
    ) as T;

    const ctx = set(Object.freeze(out));
    const res = fn(ctx);

    storage.ctx = parentContext;
    return res;
  }

  function bind<Fn extends CB>(ctxRef: Partial<T>, fn: Fn) {
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
}
