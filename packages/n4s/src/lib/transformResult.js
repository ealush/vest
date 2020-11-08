import isFunction from 'isFunction';
import throwError from 'throwError';

export function validateResult(result, rule) {
  // if result is boolean, or if result.pass is boolean
  if (!!result !== result && (!result || !!result.pass !== result.pass)) {
    throwError(
      `${rule.name} wrong return value for the rule please check that the return is valid`
    );
  }
}

// for easier testing and mocking
export function getDefaultResult(value, rule) {
  return {
    message: formatResultMessage(rule, `invalid ${typeof value} value`),
  };
}

export function formatResultMessage(rule, msg) {
  return `[${LIBRARY_NAME}]:${rule.name} ${msg}`;
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
export function transformResult(result, { rule, value }) {
  const defaultResult = getDefaultResult(value, rule);
  validateResult(result, rule);

  // if result is boolean
  if (!!result === result) {
    return (defaultResult.pass = result), defaultResult;
  } else {
    defaultResult.pass = result.pass;
    if (result.message) {
      defaultResult.message = formatResultMessage(
        rule,
        isFunction(result.message) ? result.message() : result.message
      );
    }
    return defaultResult;
  }
}
