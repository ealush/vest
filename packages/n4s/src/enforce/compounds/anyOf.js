import runLazyRules from 'runLazyRules';
import { withFirst } from 'withArgs';

/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
function anyOf(value, rules) {
  return (
    !rules.length || rules.some(ruleGroup => runLazyRules(ruleGroup, value))
  );
}

export default withFirst(anyOf);
