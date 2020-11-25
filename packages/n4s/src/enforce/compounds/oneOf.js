import one from 'one';
import runLazyRules from 'runLazyRules';
import { withFirst } from 'withArgs';

/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
function oneOf(value, rules) {
  return one.apply(null,
    rules.map(ruleGroup => runLazyRules(ruleGroup, value))
  );
}
export default withFirst(oneOf)
