/**
 * Module: `src/hooks/optional/OptionalTypes.ts`.
 *
 * Provides `OptionalTypes`-related runtime and type utilities used by `vest`.
 */
import { DynamicValue, OneOrMoreOf } from 'vest-utils';

export type OptionalFields = Record<string, OptionalFieldDeclaration>;

export type OptionalsInput<F extends string = string> =
  | OneOrMoreOf<F>
  | OptionalsObject<F>;

type OptionalsObject<F extends string> = Record<F, TOptionalRule | any>;

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
