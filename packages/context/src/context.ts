import type { CB } from 'vest-utils';
import {
  assign,
  defaultTo,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

const USEX_DEFAULT_ERROR_MESSAGE = 'Not inside of a running context.';
const EMPTY_CONTEXT = Symbol();

export function createContext<T extends unknown>(
  defaultContextValue?: T
): CtxApi<T> {
  let contextValue: T | symbol = EMPTY_CONTEXT;

  return {
    run,
    use,
    useX,
  };

  function use(): T {
    return (isInsideContext() ? contextValue : defaultContextValue) as T;
  }

  function useX(errorMessage?: string): T {
    invariant(
      isInsideContext(),
      defaultTo(errorMessage, USEX_DEFAULT_ERROR_MESSAGE)
    );
    return contextValue as T;
  }

  function run<R>(value: T, cb: () => R): R {
    const parentContext = isInsideContext() ? use() : EMPTY_CONTEXT;

    contextValue = value;

    const res = cb();

    contextValue = parentContext;
    return res;
  }

  function isInsideContext(): boolean {
    return contextValue !== EMPTY_CONTEXT;
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
