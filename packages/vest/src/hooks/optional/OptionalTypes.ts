import { DynamicValue, OneOrMoreOf } from 'vest-utils';

import { TFieldName } from 'SuiteResultTypes';

export type OptionalFields = Record<string, OptionalFieldDeclaration>;

export type OptionalsInput<F extends TFieldName> =
  | OneOrMoreOf<F>
  | OptionalsObject<F>;

type OptionalsObject<F extends TFieldName> = Record<F, TOptionalRule>;

type ImmediateOptionalFieldDeclaration = {
  type: OptionalFieldTypes.CUSTOM_LOGIC;
  rule: TOptionalRule;
  applied: boolean;
};

type DelayedOptionalFieldDeclaration = {
  type: OptionalFieldTypes.AUTO;
  applied: boolean;
  rule: null;
};

type TOptionalRule = DynamicValue<boolean>;

export type OptionalFieldDeclaration =
  | ImmediateOptionalFieldDeclaration
  | DelayedOptionalFieldDeclaration;

export enum OptionalFieldTypes {
  CUSTOM_LOGIC,
  AUTO,
}
