import { CB } from 'utilityTypes';
import {
  assign,
  defaultTo,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

export function createContext<T extends unknown>(
  defaultContextValue?: T
): CtxReturn<T> {
  let contextValue = undefined;

  return {
    use,
    run,
  };

  function use(): T {
    return defaultTo(contextValue, defaultContextValue);
  }

  function run<R>(value: T, cb: () => R): R {
    const parentContext = use();

    contextValue = value;

    const res = cb();

    contextValue = parentContext;
    return res;
  }
}

// eslint-disable-next-line max-lines-per-function
export function createCascade<T extends Record<string, unknown>>(
  init?: (ctxRef: Partial<T>, parentContext: T | void) => T | null
): CtxCascadeReturn<T> {
  let contextValue = undefined;

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

  function run<R>(ctxRef: Partial<T>, fn: () => R): R {
    const parentContext = use();

    const out = assign(
      {},
      parentContext ? parentContext : {},
      optionalFunctionValue(init, ctxRef, parentContext) ?? ctxRef
    ) as T;

    set(Object.freeze(out));

    const res = fn();

    contextValue = parentContext;
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
    return contextValue;
  }

  function set(value: T): T {
    return (contextValue = value);
  }
}

type CtxReturn<T> = {
  use: () => T;
  run: <R>(value: T, cb: () => R) => R;
};

export type CtxCascadeReturn<T> = {
  run: <R>(ctxRef: Partial<T>, fn: () => R) => R;
  bind: <Fn extends CB>(ctxRef: Partial<T>, fn: Fn) => Fn;
  use: () => T | undefined;
  useX: (errorMessage?: string) => T;
};
