import { MODE_ANY } from 'enforceKeywords';
import runCompoundChain from 'runCompoundChain';
import withArgs from 'withArgs';
/**
 * Runs chains of rules, making sure
 * that at least one assertion passes
 *
 * @param {EnforceContext} value
 * @param {[{test: Function, run: Function}]} ruleChains
 * @return {RuleResult}
 */
function anyOf(value, ruleChains) {
  return runCompoundChain(value, ruleChains, { mode: MODE_ANY });
}

export default withArgs(anyOf);
