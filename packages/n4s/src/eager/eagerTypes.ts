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

type Msg<T, A, S> = { message: (input: string) => EnforceEagerReturn<T, A, S> };

export type TRules<T, A, S> = {
  [K in keyof A as A[K] extends (...args: any) => any
    ? T extends FirstParam<Extract<A[K], AnyFn>>
      ? K
      : never
    : never]: (
    ...args: TailParams<Extract<A[K], AnyFn>>
  ) => EnforceEagerReturn<InferNextValue<T, Extract<A[K], AnyFn>>, A, S>;
};

export type TSchemaRules<T, S, A> = T extends any[]
  ? Record<string, never>
  : T extends Record<string, any>
    ? {
        [K in keyof S]: DropFirstFn<S[K]> extends (
          ...args: infer Args
        ) => infer R
          ? (...args: Args) => EnforceEagerReturn<UnwrapRuleInstance<R>, A, S>
          : never;
      }
    : Record<string, never>;

export type TArraySchemaRules<T, A, S> = T extends any[]
  ? {
      isArrayOf: <Rules extends RuleInstance<any, any>[]>(
        ...rules: Rules
      ) => EnforceEagerReturn<MultiTypeInput<Rules>[], A, S>;
    }
  : Record<string, never>;

type Base<T, A, S> = Msg<T, A, S> &
  TRules<T, A, S> &
  TCustomRules<T, A, S> &
  TSchemaRules<T, S, A> &
  TArraySchemaRules<T, A, S>;

export type EnforceEagerReturn<T = any, A = any, S = any> = Base<T, A, S> & {
  pass: boolean;
};
