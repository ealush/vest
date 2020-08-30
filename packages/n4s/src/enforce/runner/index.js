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

  const ruleResult = rule(value, ...args);
  // Handles boolean rules
  if (typeof ruleResult === 'boolean' && ruleResult !== true) {
    throw new Error(
      `[Enforce]: invalid ${typeof value} value with rule ${rule.name}`
    );
  }

  // Handles object rules { pass, message }
  if (typeof ruleResult === 'object' && !ruleResult.pass) {
    throw new Error(`[Enforce]: ${ruleResult.message}`);
  }
}

export default runner;
