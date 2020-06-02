/**
 * Run a single rule against ensured value (e.g. `isNumber()`)
 * @param {Function} rule - rule to run
 * @param {Any} value
 * @param {Array} args list of arguments sent from consumer
 * @return {Boolean}
 */
function runner(rule, value, ...args) {
  try {
    return rule(value, ...args) === true;
  } catch (err) {
    return false;
  }
}

export default runner;
