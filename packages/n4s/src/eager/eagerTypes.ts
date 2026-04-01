import { TCustomRules } from '../n4sTypes';
import { MultiTypeInput } from '../rules/schemaRules/schemaRulesTypes';
import type { RuleInstance } from '../utils/RuleInstance';

import type {
  AnyFn,
  FirstParam,
  TailParams,
  InferNextValue,
  DropFirstFn,
  UnwrapRuleInstance,
} from './typeUtils';

type ThenableEnforce = PromiseLike<void> & {
  catch: (onrejected?: ((reason: unknown) => unknown) | null) => Promise<void>;
  finally: (onfinally?: (() => void) | null) => Promise<void>;
};

type Msg<T, A, S, AsyncMode extends boolean> = {
  message: (input: string) => EnforceEagerReturn<T, A, S, AsyncMode>;
};

export type TRules<T, A, S, AsyncMode extends boolean> = {
  [K in keyof A as A[K] extends (...args: any) => any
    ? T extends FirstParam<Extract<A[K], AnyFn>>
      ? K
      : never
    : never]: (
    ...args: TailParams<Extract<A[K], AnyFn>>
  ) => EnforceEagerReturn<
    InferNextValue<T, Extract<A[K], AnyFn>>,
    A,
    S,
    AsyncMode
  >;
};

export type TSchemaRules<T, S, A, AsyncMode extends boolean> = T extends any[]
  ? Record<string, never>
  : T extends Record<string, any>
    ? {
        [K in keyof S]: DropFirstFn<S[K]> extends (
          ...args: infer Args
        ) => infer R
          ? (
              ...args: Args
            ) => EnforceEagerReturn<UnwrapRuleInstance<R>, A, S, AsyncMode>
          : never;
      }
    : Record<string, never>;

export type TArraySchemaRules<
  T,
  A,
  S,
  AsyncMode extends boolean,
> = T extends any[]
  ? {
      isArrayOf: <Rules extends RuleInstance<any, any>[]>(
        ...rules: Rules
      ) => EnforceEagerReturn<MultiTypeInput<Rules>[], A, S, AsyncMode>;
    }
  : Record<string, never>;

export type TCompoundRules<T, A, S, AsyncMode extends boolean> = {
  [K in keyof S as K extends 'allOf' | 'anyOf' | 'noneOf' | 'oneOf'
    ? K
    : never]: DropFirstFn<S[K]> extends (...args: infer Args) => infer _R
    ? (...args: Args) => EnforceEagerReturn<T, A, S, AsyncMode>
    : never;
};

export type TOptionalRule<T, A, S, AsyncMode extends boolean> = {
  [K in keyof S as K extends 'optional' ? K : never]: (
    ...args: TailParams<Extract<S[K], AnyFn>>
  ) => EnforceEagerReturn<T, A, S, AsyncMode>;
};

type Base<T, A, S, AsyncMode extends boolean> = Msg<T, A, S, AsyncMode> &
  TRules<T, A, S, AsyncMode> &
  TCustomRules<T, A, S, AsyncMode> &
  TSchemaRules<T, S, A, AsyncMode> &
  TArraySchemaRules<T, A, S, AsyncMode> &
  TCompoundRules<T, A, S, AsyncMode> &
  TOptionalRule<T, A, S, AsyncMode>;

export type EnforceEagerReturn<
  T = any,
  A = any,
  S = any,
  AsyncMode extends boolean = false,
> = Base<T, A, S, AsyncMode> &
  (AsyncMode extends true ? ThenableEnforce : unknown) & {
    pass: boolean;
  };
