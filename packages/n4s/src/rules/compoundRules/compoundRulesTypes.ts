/**
 * Compound rules type declarations.
 */
import 'allOf';
import 'anyOf';
import 'noneOf';
import 'oneOf';

import type {
  AllOfRuleInstance,
  AnyOfRuleInstance,
  NoneOfRuleInstance,
  OneOfRuleInstance,
} from 'compoundRules';

/**
 * Type mappings for compound rule lazy API return types
 */
export type CompoundRuleLazyTypes = {
  allOf: <T>(...rules: any[]) => AllOfRuleInstance<T>;
  anyOf: <T>(...rules: any[]) => AnyOfRuleInstance<T>;
  noneOf: <T>(...rules: any[]) => NoneOfRuleInstance<T>;
  oneOf: <T>(...rules: any[]) => OneOfRuleInstance<T>;
};
