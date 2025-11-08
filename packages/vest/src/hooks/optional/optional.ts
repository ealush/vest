import { enforce } from 'n4s';
import { isArray, isStringValue, asArray, hasOwnProperty } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { SuiteOptionalFields, TIsolateSuite } from 'IsolateSuite';
import { OptionalFieldTypes, OptionalsInput } from 'OptionalTypes';
import { useSuiteParams } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';

// @vx-allow use-use
export function optional<F extends TFieldName>(
  optionals: OptionalsInput<F>,
): void {
  const suiteRoot = VestRuntime.useAvailableRoot<TIsolateSuite>();

  const suiteParams = useSuiteParams();
  const dataObject = suiteParams?.[0] ?? {};

  // There are two types of optional field declarations:

  // 1 AUTO: Vest will automatically determine whether the field should be omitted
  // Based on the current run. Vest will omit "auto" added fields without any
  // configuration if their tests did not run at all in the suite, or if the data object
  // contains a blank value for the field.
  //
  // 2 Custom logic: Vest will determine whether they should fail based on the custom
  // logic supplied by the developer.
  // If the developer supplies a function - when the function returns true, the field will be omitted.
  // If the developer supplies a boolean - the field will be omitted if the value is true.
  // If the developer supplies a value - the field will be omitted if the value is blank.

  // AUTO case (field name)
  if (isArray(optionals) || isStringValue(optionals)) {
    asArray(optionals).forEach(optionalField => {
      SuiteOptionalFields.setOptionalField(suiteRoot, optionalField, () => ({
        type: OptionalFieldTypes.AUTO,
        applied: hasOwnProperty(dataObject, optionalField)
          ? enforce.isBlank().test(dataObject?.[optionalField])
          : false,
        rule: null,
      }));
    });
  } else {
    // CUSTOM_LOGIC case (function or boolean)
    for (const field in optionals) {
      const value = optionals[field];

      SuiteOptionalFields.setOptionalField(suiteRoot, field, () => ({
        type: OptionalFieldTypes.CUSTOM_LOGIC,
        rule: value,
        applied: enforce.isBlank().test(value) || value === true,
      }));
    }
  }
}

export function useIsOptionalFieldApplied(fieldName?: TFieldName) {
  if (!fieldName) {
    return false;
  }

  const root = VestRuntime.useAvailableRoot<TIsolateSuite>();

  return (
    SuiteOptionalFields.getOptionalField(root, fieldName)?.applied ?? false
  );
}
