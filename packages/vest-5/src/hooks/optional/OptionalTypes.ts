export type OptionalFields = Record<string, OptionalFieldDeclaration>;

export type OptionalsInput = string | string[] | OptionalsObject;

type OptionalsObject = Record<string, (() => boolean) | boolean>;

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
