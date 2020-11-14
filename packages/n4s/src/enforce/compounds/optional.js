import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';
import runLazyRules from 'runLazyRules';

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

  return runLazyRules(ruleGroups, obj[key]);
}
