import type {
  AnyFn,
  FirstParam,
  TailParams,
  InferNextValue,
  DropFirstFn,
  UnwrapRuleInstance,
} from 'typeUtils';

import type { RuleInstance } from 'RuleInstance';
import { TCustomRules } from 'n4sTypes';
import { ArraySchemaResultMap } from 'schemaRulesTypes';

type Msg<T> = { message: (input: string) => EnforceEagerReturn<T> };

export type TRules<T, A> = {
  [K in keyof A as A[K] extends (...args: any) => any
    ? T extends FirstParam<Extract<A[K], AnyFn>>
      ? K
      : never
    : never]: (
    ...args: TailParams<Extract<A[K], AnyFn>>
  ) => EnforceEagerReturn<InferNextValue<T, Extract<A[K], AnyFn>>>;
};

export type TSchemaRules<T, S> =
  T extends Record<string, any>
    ? {
        [K in keyof S]: DropFirstFn<S[K]> extends (...args: infer A) => infer R
          ? (...args: A) => EnforceEagerReturn<UnwrapRuleInstance<R>>
          : never;
      }
    : Record<string, never>;

export type TArraySchemaRules<T> = T extends any[]
  ? {
      [K in keyof ArraySchemaResultMap<any>]: <
        S extends RuleInstance<any, any>[],
      >(
        ...rules: S
      ) => EnforceEagerReturn<ArraySchemaResultMap<S>[K]>;
    }
  : Record<string, never>;

type Base<T, A, S> = Msg<T> &
  TRules<T, A> &
  TCustomRules<T> &
  TSchemaRules<T, S> &
  TArraySchemaRules<T>;

export type EnforceEagerReturn<T = any, A = any, S = any> = Base<T, A, S> & {
  pass: boolean;
};
