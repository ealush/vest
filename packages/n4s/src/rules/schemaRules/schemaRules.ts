/**
 * Module: `src/rules/schemaRules/schemaRules.ts`.
 *
 * Provides `schemaRules`-related runtime and type utilities used by `n4s`.
 */
import './schemaRulesLazyTypes';

export { isArrayOf, type IsArrayOfRuleInstance } from './isArrayOf';
export { loose, type LooseRuleInstance } from './loose';
export { optional, type OptionalRuleInstance } from './optional';
export { partial, type PartialRuleInstance } from './partial';
export { shape, type ShapeRuleInstance } from './shape';
export type { SchemaRuleLazyTypes } from './schemaRulesLazyTypes';
