import EnforceContext from 'EnforceContext';
import RuleResult from 'RuleResult';
import { MODE_ANY } from 'enforceKeywords';
import { isNotArray } from 'isArray';
import runCompoundChain from 'runCompoundChain';
import withArgs from 'withArgs';

/**
 * Asserts that each element in an array passes
 * at least one of the provided rule chain
 *
 * @param {EnforceContext} value
 * @param {[{test: Function, run: Function}]} ruleChains
 * @return {RuleResult}
 */
function isArrayOf(value, ruleChains) {
  const plainValue = EnforceContext.unwrap(value);
  const result = new RuleResult(true).asArray();

  // Fails if current value is not an array
  if (isNotArray(plainValue)) {
    return result.setFailed(true);
  }

  for (let i = 0; i < plainValue.length; i++) {
    // Set result per each item in the array|
    result.setChild(
      i,
      runCompoundChain(
        EnforceContext.wrap(plainValue[i]).setFailFast(value.failFast),
        ruleChains,
        { mode: MODE_ANY }
      )
    );
  }

  return result;
}

export default withArgs(isArrayOf);
