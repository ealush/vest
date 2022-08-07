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
  let contextValue: T | undefined = undefined;

  return {
    use,
    run,
  };

  function use(): T | undefined {
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
    return function (...runTimeArgs: Parameters<Fn>) {
      return run<ReturnType<Fn>>(value, function () {
        return fn(...runTimeArgs);
      });
    } as Fn;
  }
}

export type CtxReturn<T> = {
  use: () => T | undefined;
  run: <R>(value: T, cb: () => R) => R;
};

export type CtxCascadeReturn<T> = {
  run: <R>(value: Partial<T>, fn: () => R) => R;
  bind: <Fn extends CB>(value: Partial<T>, fn: Fn) => Fn;
  use: () => T | undefined;
  useX: (errorMessage?: string) => T;
};
