import { RuleInstance } from 'enforce';
import { isNumeric as isNumericValue } from 'vest-utils';

export interface NotNumericRuleInstance extends RuleInstance<any, [any]> {}

export function isNotNumeric(value: any): boolean {
  // Accept numbers (including Infinity) and numeric strings as numeric
  if (typeof value === 'number') {
    // Only NaN is not numeric among numbers
    return Number.isNaN(value);
  }
  // For strings, use the vest-utils isNumeric which excludes Infinity strings
  return !isNumericValue(value);
}
