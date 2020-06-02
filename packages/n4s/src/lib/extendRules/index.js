/**
 * Collects rules with `negativeForm` or `alias` attributes.
 * Adds a rule with the correct configuration.
 * @param {Object} rules - enforce rules object
 * @returns {Object} extended rules object
 */
function extendRules(rules) {
  for (const rule in rules) {
    const negativeForm = rules[rule].negativeForm;
    const alias = rules[rule].alias;

    if (negativeForm) {
      rules[negativeForm] = (...args) => !rules[rule](...args);
    }

    if (alias) {
      rules[alias] = rules[rule];
    }
  }

  return rules;
}

export default extendRules;
