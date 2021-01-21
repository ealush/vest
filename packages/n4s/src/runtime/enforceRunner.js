import EnforceContext from 'EnforceContext';
import isCompound from 'isCompound';
import { transformResult } from 'transformResult';

/**
 * Run a single rule against enforced value (e.g. `isNumber()`)
 *
 * @param {Function} rule - rule to run
 * @param {Any} value
 * @param {Array} args list of arguments sent from consumer
 * @throws
 */
function runner(rule, value, args = []) {
  let result;
  const isCompoundRule = isCompound(rule);

  const ruleValue = isCompoundRule
    ? EnforceContext.wrap(value).setFailFast(true)
    : EnforceContext.unwrap(value);

  result = rule.apply(null, [ruleValue].concat(args));

  if (!isCompoundRule) {
    result = transformResult(result, {
      rule,
      value,
    });
  }

  if (!result.pass) {
    throw result.message;
  }
}

export default runner;
