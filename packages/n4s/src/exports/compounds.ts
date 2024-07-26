import { enforce } from 'n4s';

import { EnforceCustomMatcher } from '@/lib/enforceUtilityTypes';
import { RuleDetailedResult } from '@/lib/ruleReturn';
import { allOf } from '@/plugins/compounds/allOf';
import { anyOf } from '@/plugins/compounds/anyOf';
import { noneOf } from '@/plugins/compounds/noneOf';
import { oneOf } from '@/plugins/compounds/oneOf';
import { Lazy } from '@/runtime/genEnforceLazy';

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
