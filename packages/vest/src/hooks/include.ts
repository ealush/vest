import defaultTo from 'defaultTo';
import hasOwnProperty from 'hasOwnProperty';
import invariant from 'invariant';
import { isStringValue } from 'isStringValue';
import optionalFunctionValue from 'optionalFunctionValue';

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

    inclusion[fieldName] = (): boolean => {
      if (hasOwnProperty(exclusion.tests, fieldName)) {
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
