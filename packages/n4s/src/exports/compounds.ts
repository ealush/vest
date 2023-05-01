import { enforce } from 'n4s';

import { allOf } from 'allOf';
import { anyOf } from 'anyOf';
import { EnforceCustomMatcher } from 'enforceUtilityTypes';
import { Lazy } from 'genEnforceLazy';
import { noneOf } from 'noneOf';
import { oneOf } from 'oneOf';
import { RuleDetailedResult } from 'ruleReturn';

enforce.extend({ allOf, anyOf, noneOf, oneOf });

type EnforceCompoundRule = (
  value: unknown,
  ...rules: Lazy[]
) => RuleDetailedResult;

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      allOf: EnforceCustomMatcher<EnforceCompoundRule, R>;
      anyOf: EnforceCustomMatcher<EnforceCompoundRule, R>;
      noneOf: EnforceCustomMatcher<EnforceCompoundRule, R>;
      oneOf: EnforceCustomMatcher<EnforceCompoundRule, R>;
    }
  }
}
