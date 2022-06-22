import { isArray, isStringValue, asArray } from 'vest-utils';

import { useSetOptionalField } from 'stateHooks';

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
      useSetOptionalField(optionalField, [true, false]);
    });
  } else {
    // if it's an object, we iterate over the keys and add them to the list
    const optionalFunctions = optionals;
    for (const field in optionalFunctions) {
      const predicate = optionalFunctions[field];
      useSetOptionalField(field, [predicate, false]);
    }
  }
}

type OptionalsInput = string | string[] | OptionalsObject;

type OptionalsObject = Record<string, () => boolean>;
