import type { RuleInstance } from 'RuleInstance';

export type AnyFn = (...args: any[]) => any;

export type FirstParam<F extends AnyFn> = F extends (
  arg: infer A,
  ...rest: any
) => any
  ? A
  : never;

export type TailParams<F extends AnyFn> = F extends (
  arg: any,
  ...rest: infer R
) => any
  ? R
  : never;

export type InferNextValue<T, F extends AnyFn> = F extends (
  arg: any,
  ...rest: any
) => arg is infer Narrowed
  ? Narrowed
  : ReturnType<F> extends RuleInstance<infer Inner>
    ? Inner
    : ReturnType<F> extends boolean | void
      ? T
      : ReturnType<F> extends T
        ? T
        : ReturnType<F>;

export type DropFirstFn<F> = F extends (arg: any, ...rest: infer R) => infer Ret
  ? (...args: R) => Ret
  : never;

export type UnwrapRuleInstance<R> = R extends RuleInstance<infer V> ? V : R;
