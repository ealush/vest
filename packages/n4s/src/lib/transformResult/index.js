import defaults from 'lodash/defaults';

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
 * @param {string} interfaceName
 * @param {*} result
 * @param {function} options.rule
 * @param {*} option.value
 * @returns {Object} result
 * @returns {string} result.message
 * @returns {boolean} result.pass
 */
export function transformResult(interfaceName, result, { rule, value }) {
  const defaultResult = getDefaultResult(interfaceName, value, rule);

  if (!isValidResult(result)) {
    // #TODO handle invalid result
    throw new Error(
      `[${interfaceName}]/${rule.name} wrong return value for the rule please check that the return is valid`
    );
    // return { pass: false,  message:  `[${interfaceName}]/${rule.name} wrong return value for the rule please check that the return is valid`}
  }

  if (typeof result === 'boolean') {
    return defaults({ pass: result }, defaultResult);
  } else {
    const formattedResult = {};
    if (result.message) {
      formattedResult.message = formatResultMessage(
        interfaceName,
        rule,
        typeof result.message === 'function' ? result.message() : result.message
      );
    }
    return defaults(formattedResult, result, defaultResult);
  }
}

export const transformResultEnforce = transformResult.bind(null, 'Enforce');
export const transformResultEnsure = transformResult.bind(null, 'Ensure');
