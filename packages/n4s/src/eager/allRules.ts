/**
 * Module: `src/eager/allRules.ts`.
 *
 * Provides `allRules`-related runtime and type utilities used by `n4s`.
 */
import * as arrayRules from '../rules/arrayRules';
import * as booleanRules from '../rules/booleanRules';
import * as commonComparison from '../rules/commonComparison';
import * as commonContainer from '../rules/commonContainer';
import * as commonLength from '../rules/commonLength';
import * as compoundRules from '../rules/compoundRules/compoundRules';
import * as generalRules from '../rules/generalRules';
import * as nullishRules from '../rules/nullishRules';
import * as numberRules from '../rules/numberRules';
import { isNumeric } from '../rules/numeric/isNumeric';
import * as objectRules from '../rules/objectRules';
import * as schemaRules from '../rules/schemaRules/schemaRules';
import * as stringRules from '../rules/stringRules';

export const allRules = {
  ...arrayRules,
  ...booleanRules,
  ...commonComparison,
  ...commonContainer,
  ...commonLength,
  ...generalRules,
  ...nullishRules,
  ...numberRules,
  // not ideal but it helps us that all the numeric rules are exported directly from number rules
  isNumeric,
  ...objectRules,
  ...stringRules,
} as const;

export const schemaRulesMap = {
  ...compoundRules,
  ...schemaRules,
} as const;
