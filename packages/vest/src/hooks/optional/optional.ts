import {
  isArray,
  isStringValue,
  asArray,
  optionalFunctionValue,
  assign,
} from 'vest-utils';

import {
  OptionalFieldDeclaration,
  OptionalFieldTypes,
  OptionalsInput,
} from 'OptionalTypes';
import { useOptionalField, useOptionalFields } from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';

export function optional<F extends TFieldName>(
  optionals: OptionalsInput<F>
): void {
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

export function isOptionalFiedApplied(fieldName?: TFieldName) {
  if (!fieldName) {
    return false;
  }

  return useOptionalField(fieldName).applied;
}

function useSetOptionalField(
  fieldName: TFieldName,
  setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration
): void {
  const current = useOptionalFields();
  const currentField = useOptionalField(fieldName);

  assign(current, {
    [fieldName]: assign({}, currentField, setter(currentField)),
  });
}
