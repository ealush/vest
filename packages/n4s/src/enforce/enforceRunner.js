import { transformResult } from 'transformResult';

/**
 * Run a single rule against enforced value (e.g. `isNumber()`)
 *
 * @param {Function} rule - rule to run
 * @param {Any} value
 * @param {Array} args list of arguments sent from consumer
 * @throws
 */
function runner(rule, value, args) {
  // spreading here instead of passing rest params because of significant bundle size impact
  const ruleResult = rule(value, ...(args || []));
  const result = transformResult(ruleResult, { rule, value });
  if (!result.pass) {
    throw new Error(result.message);
  }
}

export default runner;
