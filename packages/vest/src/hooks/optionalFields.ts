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
