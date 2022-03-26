import asArray from 'asArray';
import { isArray } from 'isArrayValue';
import { isStringValue } from 'isStringValue';

import { useOptionalFields } from 'stateHooks';

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
  const [, setOptionalFields] = useOptionalFields();

  setOptionalFields(state => {
    if (!isArray(optionals) && !isStringValue(optionals)) {
      const optionalFunctions = optionals;
      for (const field in optionalFunctions) {
        const predicate = optionalFunctions[field];
        state[field] = predicate;
      }
    } else {
      asArray(optionals).forEach(optionalField => {
        state[optionalField] = true;
      });
    }

    return state;
  });
}

type OptionalsInput = string | string[] | OptionalsObject;

type OptionalsObject = Record<string, () => boolean>;
