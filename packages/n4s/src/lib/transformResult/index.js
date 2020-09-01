export function isValidResult(result) {
  return !!(
    typeof result === 'boolean' ||
    (result && typeof result.pass === 'boolean')
  );
}

// for easier testing and mocking
export function getDefaultResult(interfaceName, value, rule) {
  return {
    message: formatResultMessage(
      interfaceName,
      rule,
      `invalid ${typeof value} value`
    ),
  };
}

export function formatResultMessage(interfaceName, rule, msg) {
  return `[${interfaceName}]/${rule.name} ${msg}`;
}

/**
 * Transform the result of a rule into a standard format
 * @param {string} interfaceName to be used in the messages
 * @param {*} result of the rule
 * @param {Object} options
 * @param {function} options.rule
 * @param {*} options.value
 * @returns {Object} result
 * @returns {string} result.message
 * @returns {boolean} result.pass indicates if the test passes or not
 */
export function transformResult(interfaceName, result, { rule, value }) {
  const defaultResult = getDefaultResult(interfaceName, value, rule);

  if (!isValidResult(result)) {
    // #TODO handle invalid result
    throw new Error(
      `[${interfaceName}]/${rule.name} wrong return value for the rule please check that the return is valid`
    );
  }

  if (typeof result === 'boolean') {
    return { ...defaultResult, pass: result };
  } else {
    const formattedResult = {
      pass: result.pass,
    };
    if (result.message) {
      formattedResult.message = formatResultMessage(
        interfaceName,
        rule,
        typeof result.message === 'function' ? result.message() : result.message
      );
    }
    return { ...defaultResult, ...formattedResult };
  }
}

export const transformResultEnforce = transformResult.bind(null, 'Enforce');
export const transformResultEnsure = transformResult.bind(null, 'Ensure');
