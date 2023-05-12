import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';

export type OptionalFields<F extends TFieldName, G extends TGroupName> = Record<
  F,
  OptionalFieldDeclaration<F, G>
>;

export type OptionalsInput<F extends TFieldName, G extends TGroupName> =
  | F
  | F[]
  | OptionalsObject<F, G>;

export type OptionalFieldRule<F extends TFieldName, G extends TGroupName> =
  | boolean
  | ((suiteResult: SuiteResult<F, G>) => boolean);

type OptionalsObject<F extends TFieldName, G extends TGroupName> = Record<
  F,
  OptionalFieldRule<F, G>
>;

export type OptionalFieldDeclaration<
  F extends TFieldName,
  G extends TGroupName
> = {
  rule: OptionalFieldRule<F, G>;
  applied: boolean;
};
