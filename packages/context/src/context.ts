import { CB } from 'utilityTypes';
import {
  assign,
  defaultTo,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

export function createContext<T extends unknown>(
  defaultContextValue?: T
): CtxApi<T> {
  let contextValue: T | undefined = undefined;

  return {
    run,
    use,
    useX,
  };

  function use(): T {
    return defaultTo(contextValue, defaultContextValue) as T;
  }

  function useX(errorMessage?: string): T {
    const contextValue = use();
    invariant(
      contextValue,
      defaultTo(errorMessage, 'Context was used after it was closed')
    );
    return contextValue;
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
): CtxCascadeApi<T> {
  const ctx = createContext<T>();

  return {
    bind,
    run,
    use: ctx.use,
    useX: ctx.useX,
  };

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

type ContextConsumptionApi<T> = {
  use: () => T;
  useX: (errorMessage?: string) => T;
};

export type CtxApi<T> = ContextConsumptionApi<T> & {
  run: <R>(value: T, cb: () => R) => R;
};

export type CtxCascadeApi<T> = ContextConsumptionApi<T> & {
  run: <R>(value: Partial<T>, fn: () => R) => R;
  bind: <Fn extends CB>(value: Partial<T>, fn: Fn) => Fn;
};
