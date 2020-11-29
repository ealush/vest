import runLazyRules from 'runLazyRules';
import { withFirst } from 'withArgs';

/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
function oneOf(value, rules) {
  let count = 0;

  for (let i = 0; i < rules.length; i++) {
    if (runLazyRules(rules[i], value)) {
      count++;
    }

    if (count > 1) {
      return false;
    }
  }

  return count === 1;
}
export default withFirst(oneOf)
