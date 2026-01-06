import type { CB, Maybe } from 'vest-utils';
import {
  assign,
  defaultTo,
  invariant,
  dynamicValue,
  Nullable,
} from 'vest-utils';

const USEX_DEFAULT_ERROR_MESSAGE = 'Not inside of a running context.';
const EMPTY_CONTEXT = Symbol();

/**
 * Creates a context API for temporarily setting and accessing a value of type `T`.
 *
 * The returned API lets callers run a function with a provided context value (restoring the previous
 * context after the function completes, even if it throws), read the current context value with a
 * fallback, or read the current context value and throw if none is active.
 *
 * @param defaultContextValue - Value returned by `use()` when no context is active
 * @returns An object with:
 *  - `run(value, cb)` — executes `cb` with the context set to `value` and restores the prior context after `cb` finishes (restoration occurs even if `cb` throws).
 *  - `use()` — returns the current context value if a context is active, otherwise returns `defaultContextValue`.
 *  - `useX(errorMessage?)` — returns the current context value if a context is active; throws an error with `errorMessage` (or a default message) when no context is active.
 */
export function createContext<T>(defaultContextValue?: T): CtxApi<T> {
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
      defaultTo(errorMessage, USEX_DEFAULT_ERROR_MESSAGE),
    );
    return contextValue as T;
  }

  /**
   * Executes a callback with the context set to the provided value and restores the previous context when the callback completes or throws.
   *
   * @param value - Context value to set for the duration of `cb`
   * @param cb - Function to execute while the given context is active
   * @returns The value returned by `cb`
   */
  function run<R>(value: T, cb: () => R): R {
    const parentContext = isInsideContext() ? use() : EMPTY_CONTEXT;
    contextValue = value;
    
    try {
      return cb();
    } finally {
      contextValue = parentContext;
    }
  }

  /**
   * Determines whether a context is currently active.
   *
   * @returns `true` if a context is active, `false` otherwise.
   */
  function isInsideContext(): boolean {
    return contextValue !== EMPTY_CONTEXT;
  }
}

/**
 * Cascading context - another implementation of context, that assumes the context value is an object.
 * When nesting context runs, the the values of the current layer merges with the layers above it.
 */
export function createCascade<T extends Record<string, unknown>>(
  init?: (value: Partial<T>, parentContext: Maybe<T>) => Nullable<T>,
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

    const initResult = dynamicValue(init, value, parentContext) ?? value;

    const out = assign({}, parentContext ? parentContext : {}, initResult) as T;

    return ctx.run(Object.freeze(out), fn) as R;
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