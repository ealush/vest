import runLazyRules from 'runLazyRules';

/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
export default function oneOf(value, ...rules) {
  return (rules) && (rules.filter(ruleGroup => runLazyRules(ruleGroup, value)).length === 1);
}
