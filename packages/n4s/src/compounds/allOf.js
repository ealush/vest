import { MODE_ALL } from 'enforceKeywords';
import runCompoundChain from 'runCompoundChain';
import withArgs from 'withArgs';

/**
 * Runs a chain of rules, making sure that all assertions pass
 *
 * @param {EnforceContext} value
 * @param {[{test: Function, run: Function}]} ruleChains
 * @return {RuleResult}
 */
function allOf(value, rules) {
  return runCompoundChain(value, rules, { mode: MODE_ALL });
}

export default withArgs(allOf);
