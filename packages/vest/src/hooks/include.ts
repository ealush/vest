import {
  isStringValue,
  defaultTo,
  hasOwnProperty,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

import ctx from 'ctx';
import { produceSuiteResult, SuiteResult } from 'produceSuiteResult';

export default function include(fieldName: string): {
  when: (
    condition: string | boolean | ((draft: SuiteResult) => boolean)
  ) => void;
} {
  const context = ctx.useX();
  const { inclusion, exclusion } = context;

  invariant(isStringValue(fieldName));

  inclusion[fieldName] = defaultTo(exclusion.tests[fieldName], true);

  return { when };

  function when(
    condition: string | ((draft: SuiteResult) => boolean) | boolean
  ): void {
    const context = ctx.useX();
    const { inclusion, exclusion } = context;

    // This callback will run as part of the "isExcluded" series of checks
    inclusion[fieldName] = (): boolean => {
      if (hasOwnProperty(exclusion.tests, fieldName)) {
        // I suspect this code is technically unreachable because
        // if there are any skip/only rules applied to the current
        // field, the "isExcluded" function will have already bailed
        return defaultTo(exclusion.tests[fieldName], true);
      }

      if (isStringValue(condition)) {
        return Boolean(exclusion.tests[condition]);
      }

      return optionalFunctionValue(
        condition,
        optionalFunctionValue(produceSuiteResult)
      );
    };
  }
}
