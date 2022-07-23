import {
  isArray,
  isStringValue,
  asArray,
  optionalFunctionValue,
} from 'vest-utils';

import { useOptionalField, useSetOptionalField } from 'stateHooks';

/**
 * Marks a field as optional, either just by name, or by a given condition.
 *
 * @example
 *
 * optional('field_name');
 *
 * optional({
 *  username: () => allowUsernameEmpty,
 * });
 */
export default function optional(optionals: OptionalsInput): void {
  // When the optional is given as a string or a list of strings
  // we just add them to the list of optional fields.
  if (isArray(optionals) || isStringValue(optionals)) {
    asArray(optionals).forEach(optionalField => {
      // [true: the field is declared as optional but..., false: the rule was not applied yet, treated as non optional for now]
      useSetOptionalField(optionalField, () => ({
        type: OptionalFieldTypes.Delayed,
        applied: false,
        rule: null,
      }));
    });
  } else {
    // if it's an object, we iterate over the keys and add them to the list
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

export function optionalFiedIsApplied(fieldName?: string) {
  if (!fieldName) {
    return false;
  }

  return useOptionalField(fieldName).applied;
}

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
