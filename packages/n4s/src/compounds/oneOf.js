import { MODE_ONE } from 'enforceKeywords';
import runCompoundChain from 'runCompoundChain';
import withArgs from 'withArgs';

/**
 * @param {EnforceContext} value
 * @param {[{test: Function, run: Function}]} ruleChains
 * @return {RuleResult}
 */
function oneOf(value, rules) {
  return runCompoundChain(value, rules, { mode: MODE_ONE });
}
export default withArgs(oneOf);
