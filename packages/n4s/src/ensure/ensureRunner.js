import { transformResult } from 'transformResult';

/**
 * Run a single rule against ensured value (e.g. `isNumber()`)
 * @param {Function} rule - rule to run
 * @param {Any} value
 * @param {Array} args list of arguments sent from consumer
 * @return {Boolean}
 */
function runner(rule, value, ...args) {
  try {
    const result = rule(value, ...args);
    return transformResult(result, { rule, value }).pass;
  } catch (err) {
    return false;
  }
}

export default runner;
