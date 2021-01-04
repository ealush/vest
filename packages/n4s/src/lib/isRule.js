import hasOwnProperty from 'hasOwnProperty';

import isFunction from 'isFunction';
import runtimeRules from 'runtimeRules';
/**
 * Determines whether a given string is a name of a rule
 *
 * @param {string} name
 * @return {boolean}
 */
const isRule = name =>
  hasOwnProperty(runtimeRules, name) && isFunction(runtimeRules[name]);

export default isRule;
