import { TFieldName } from 'SuiteResultTypes';

export type OptionalFields = Record<string, OptionalFieldDeclaration>;

export type OptionalsInput<F extends TFieldName> = F | F[] | OptionalsObject<F>;

type OptionalsObject<F extends TFieldName> = Record<
  F,
  (() => boolean) | boolean
>;

type ImmediateOptionalFieldDeclaration = {
  type: OptionalFieldTypes.Immediate;
  rule: boolean | (() => boolean);
  applied: boolean;
};

type DelayedOptionalFieldDeclaration = {
  type: OptionalFieldTypes.Delayed;
  applied: boolean;
  rule: null;
};

export type OptionalFieldDeclaration =
  | ImmediateOptionalFieldDeclaration
  | DelayedOptionalFieldDeclaration;

export enum OptionalFieldTypes {
  Immediate,
  Delayed,
}
