import {
  isArray,
  isStringValue,
  asArray,
  isBoolean,
  optionalFunctionValue,
} from 'vest-utils';

import { useOptionalFieldApplied, useSetOptionalField } from 'stateHooks';

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
      useSetOptionalField(optionalField, [true, false]);
    });
  } else {
    // if it's an object, we iterate over the keys and add them to the list
    for (const field in optionals) {
      const value = optionals[field];

      useSetOptionalField(
        field,
        //This looks kind of complicated. We might need to simplify that.

        // 1. If the provided condition is a boolean, we just use it, and apply it immediately.
        //    The assumption is that a boolean is an immediate omission rule
        // 2. If the provided condition is a function, we run it immediately, and use its result as the "apply"
        //    We might or might not run the function again in the future.
        isBoolean(value)
          ? [value, value]
          : [value, optionalFunctionValue(value)]
      );
    }
  }
}

export function optionalFiedIsOmitted(fieldName?: string) {
  if (!fieldName) {
    return false;
  }

  return useOptionalFieldApplied(fieldName) === true;
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
};

export type OptionalFieldDeclaration =
  | ImmediateOptionalFieldDeclaration
  | DelayedOptionalFieldDeclaration;

enum OptionalFieldTypes {
  Immediate,
  Delayed,
}
