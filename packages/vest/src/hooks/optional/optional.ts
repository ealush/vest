import { isArray, isStringValue, asArray } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import type { IsolateSuite } from 'IsolateSuite';
import { OptionalFieldTypes, OptionalsInput } from 'OptionalTypes';
import { TFieldName } from 'SuiteResultTypes';

// @vx-allow use-use
export function optional<F extends TFieldName>(
  optionals: OptionalsInput<F>
): void {
  const suiteRoot = VestRuntime.useAvailableRoot<IsolateSuite>();

  // There are two types of optional field declarations:

  // 1 AUTO: Vest will automatically determine whether the field should be omitted
  // Based on the current run. Vest will ommit "auto" added fields without any
  // configuration if their tests did not run at all in the suite.
  //
  // 2 Custom logic: Vest will determine whether they should fail based on the custom
  // logic supplied by the user.

  // AUTO case (field name)
  if (isArray(optionals) || isStringValue(optionals)) {
    asArray(optionals).forEach(optionalField => {
      suiteRoot.setOptionalField(optionalField, () => ({
        type: OptionalFieldTypes.AUTO,
        applied: false,
        rule: null,
      }));
    });
  } else {
    // CUSTOM_LOGIC case (function or boolean)
    for (const field in optionals) {
      const value = optionals[field];

      suiteRoot.setOptionalField(field, () => ({
        type: OptionalFieldTypes.CUSTOM_LOGIC,
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

  return (
    VestRuntime.useAvailableRoot<IsolateSuite>()?.getOptionalField(fieldName)
      ?.applied ?? false
  );
}
