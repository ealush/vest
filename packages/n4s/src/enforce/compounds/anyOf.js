import runLazyRules from 'runLazyRules';

/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
export default function anyOf(value, ...rules) {
  return !(rules.length) || rules.some(ruleGroup => runLazyRules(ruleGroup, value));
}
