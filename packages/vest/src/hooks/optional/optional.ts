import { isArray, isStringValue, asArray } from 'vest-utils';

import type { IsolateSuite } from 'IsolateSuite';
import { OptionalFieldTypes, OptionalsInput } from 'OptionalTypes';
import { useAvailableSuiteRoot, useRuntimeRoot } from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';

// @vx-allow use-use
export function optional<F extends TFieldName>(
  optionals: OptionalsInput<F>
): void {
  const suiteRoot = useRuntimeRoot() as IsolateSuite;

  // There are two types of optional field declarations:

  // 1. Delayed: A string, which is the name of the field to be optional.
  // We will only determine whether to omit the test after the suite is done running
  //
  // 2. Immediate: Either a boolean or a function, which is used to determine
  // if the field should be optional.

  // Delayed case (field name)
  if (isArray(optionals) || isStringValue(optionals)) {
    asArray(optionals).forEach(optionalField => {
      suiteRoot.setOptionalField(optionalField, () => ({
        type: OptionalFieldTypes.Delayed,
        applied: false,
        rule: null,
      }));
    });
  } else {
    // Immediately case (function or boolean)
    for (const field in optionals) {
      const value = optionals[field];

      suiteRoot.setOptionalField(field, () => ({
        type: OptionalFieldTypes.Immediate,
        rule: value,
        applied: value === true,
      }));
    }
  }
}

export function useIsOptionalFiedApplied(fieldName?: TFieldName) {
  if (!fieldName) {
    return false;
  }

  return useAvailableSuiteRoot()?.getOptionalField(fieldName)?.applied ?? false;
}
