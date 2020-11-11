import asArray from 'asArray';
import { RUN_RULE } from 'enforceKeywords';
import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';

/**
 * @param {Array} ObjectEntry   Object and key leading to current value
 * @param {Function[]} rules    Rules to validate the value with
 */
export default function optional([obj, key], ...ruleGroups) {
  if (
    !Object.prototype.hasOwnProperty.call(obj, key) ||
    isUndefined(obj[key] || isNull(obj[key]))
  ) {
    return true;
  }

  return asArray(ruleGroups).every(ruleGroup => {
    return ruleGroup[RUN_RULE].every(fn => fn(obj[key]));
  });
}
