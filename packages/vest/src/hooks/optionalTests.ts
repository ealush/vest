import asArray from 'asArray';
import { isArray } from 'isArrayValue';
import { isStringValue } from 'isStringValue';

import { useOptionalFields } from 'stateHooks';

export default function optional(optionals: TOptionalsInput): void {
  const [, setOptionalFields] = useOptionalFields();

  setOptionalFields(state => {
    if (!isArray(optionals) && !isStringValue(optionals)) {
      const optionalFunctions = optionals as TOptionalsObject;
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

type TOptionalsInput = string | string[] | TOptionalsObject;

export type TOptionalsObject = Record<string, () => boolean>;
