import * as arrayRules from 'arrayRules';
import * as booleanRules from 'booleanRules';
import * as commonComparison from 'commonComparison';
import * as commonContainer from 'commonContainer';
import * as commonLength from 'commonLength';
import * as compoundRules from 'compoundRules';
import * as generalRules from 'generalRules';
import { isNumeric } from 'isNumeric';
import * as nullishRules from 'nullishRules';
import * as numberRules from 'numberRules';
import * as numericRules from 'numberRules';
import * as objectRules from 'objectRules';
import * as schemaRules from 'schemaRules';
import * as stringRules from 'stringRules';

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
  ...numericRules,
  ...objectRules,
  ...stringRules,
} as const;

export const schemaRulesMap = {
  ...compoundRules,
  ...schemaRules,
} as const;
