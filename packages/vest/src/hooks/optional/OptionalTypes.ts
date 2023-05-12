import { TFieldName } from 'SuiteResultTypes';

export type OptionalFields = Record<string, OptionalFieldDeclaration>;

export type OptionalsInput<F extends TFieldName> = F | F[] | OptionalsObject<F>;

type OptionalsObject<F extends TFieldName> = Record<
  F,
  (() => boolean) | boolean
>;

export type OptionalFieldDeclaration = {
  rule: null | boolean | (() => boolean);
  applied: boolean;
};
