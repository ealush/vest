/**
 * Compound rules type declarations.
 */
import './allOf';
import './anyOf';
import './noneOf';
import './oneOf';

import type { RuleInstance } from '../../utils/RuleInstance';

import type {
  AllOfRuleInstance,
  AnyOfRuleInstance,
  NoneOfRuleInstance,
  OneOfRuleInstance,
} from './compoundRules';

/**
 * Type mappings for compound rule lazy API return types
 */
export type CompoundRuleLazyTypes = {
  allOf: <T>(...rules: any[]) => AllOfRuleInstance<T>;
  anyOf: <Rules extends RuleInstance<any>[]>(
    ...rules: Rules
  ) => AnyOfRuleInstance<Rules[number]['infer']>;
  noneOf: <T>(...rules: any[]) => NoneOfRuleInstance<T>;
  oneOf: <Rules extends RuleInstance<any>[]>(
    ...rules: Rules
  ) => OneOfRuleInstance<Rules[number]['infer']>;
};
