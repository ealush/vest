import asArray from 'asArray';
import { isArray } from 'isArrayValue';
import { isStringValue } from 'isStringValue';

import { useOptionalFields } from 'stateHooks';

export default function optional(optionals: TOptionals): void {
  const [, setOptionalFields] = useOptionalFields();

  setOptionalFields(state => {
    if (!isArray(optionals) && !isStringValue(optionals)) {
      const optionalFunctions = optionals as TPredicateOptionals;
      for (const field in optionalFunctions) {
        const predicate = optionalFunctions[field];
        state[field] = {
          predicate,
        };
      }
    } else {
      asArray(optionals).forEach(optionalField => {
        state[optionalField] = {};
      });
    }

    return state;
  });
}

type TOptionals = string | string[] | TPredicateOptionals;

export type TPredicate = () => boolean;
export type TPredicateOptionals = Record<string, TPredicate>;
