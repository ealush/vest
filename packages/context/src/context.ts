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
  init?: (value: Partial<T>, parentContext: T | void) => T | null
): CtxCascadeReturn<T> {
  const ctx = createContext<T>();

  return {
    bind,
    run,
    use: ctx.use,
    useX,
  };

  function useX(errorMessage?: string): T {
    const contextValue = ctx.use();
    invariant(
      contextValue,
      defaultTo(errorMessage, 'Context was used after it was closed')
    );
    return contextValue;
  }

  function run<R>(value: Partial<T>, fn: () => R): R {
    const parentContext = ctx.use();

    const out = assign(
      {},
      parentContext ? parentContext : {},
      optionalFunctionValue(init, value, parentContext) ?? value
    ) as T;

    return ctx.run(Object.freeze(out), fn);
  }

  function bind<Fn extends CB>(value: Partial<T>, fn: Fn) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - this one's pretty hard to get right
    const returnedFn: Fn = function (...runTimeArgs: Parameters<Fn>) {
      return run<ReturnType<Fn>>(value, function () {
        return fn(...runTimeArgs);
      });
    };

    return returnedFn;
  }
}

type CtxReturn<T> = {
  use: () => T;
  run: <R>(value: T, cb: () => R) => R;
};

export type CtxCascadeReturn<T> = {
  run: <R>(value: Partial<T>, fn: () => R) => R;
  bind: <Fn extends CB>(value: Partial<T>, fn: Fn) => Fn;
  use: () => T | undefined;
  useX: (errorMessage?: string) => T;
};
