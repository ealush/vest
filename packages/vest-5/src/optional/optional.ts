import { createContext } from 'context';
import {
  isArray,
  isStringValue,
  asArray,
  optionalFunctionValue,
  assign,
} from 'vest-utils';

const OptionalFieldContext = createContext<OptionalFields>({});

export function useOptionalFields(): OptionalFields {
  return OptionalFieldContext.useX();
}

export function useOptionalField(fieldName: string) {
  return useOptionalFields()[fieldName];
}

export function useSetOptionalField(
  fieldName: string,
  setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration
): void {
  const current = useOptionalFields();
  const currentField = useOptionalField(fieldName);

  assign(current, {
    [fieldName]: assign({}, currentField, setter(currentField)),
  });
}

export function optional(optionals: OptionalsInput): void {
  // There are two types of optional field declarations:

  // 1. Delayed: A string, which is the name of the field to be optional.
  // We will only determine whether to omit the test after the suite is done running
  //
  // 2. Immediate: Either a boolean or a function, which is used to determine
  // if the field should be optional.

  // Delayed case (field name)
  if (isArray(optionals) || isStringValue(optionals)) {
    asArray(optionals).forEach(optionalField => {
      useSetOptionalField(optionalField, () => ({
        type: OptionalFieldTypes.Delayed,
        applied: false,
        rule: null,
      }));
    });
  } else {
    // Immediately case (function or boolean)
    for (const field in optionals) {
      const value = optionals[field];

      useSetOptionalField(field, () => ({
        type: OptionalFieldTypes.Immediate,
        rule: value,
        applied: optionalFunctionValue(value),
      }));
    }
  }
}

export function isOptionalFiedApplied(fieldName?: string) {
  if (!fieldName) {
    return false;
  }

  return useOptionalField(fieldName).applied;
}

type OptionalFields = Record<string, OptionalFieldDeclaration>;

type OptionalsInput = string | string[] | OptionalsObject;

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
