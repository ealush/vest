/**
 * Run a single rule against enforced value (e.g. `isNumber()`)
 *
 * @param {Function} rule - rule to run
 * @param {Any} value
 * @param {Array} args list of arguments sent from consumer
 * @throws
 */
function runner(rule, value, ...args) {
  if (typeof rule !== 'function') {
    return;
  }

  if (rule(value, ...args) !== true) {
    throw new Error(`[Enforce]: invalid ${typeof value} value`);
  }
}

export default runner;
