/**
 * Compound rules type declarations.
 * The actual ValueFirstRules declarations are colocated with each rule implementation.
 * This file just imports them to ensure they're included in the type system.
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
