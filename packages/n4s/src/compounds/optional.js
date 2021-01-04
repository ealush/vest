import hasOwnProperty from 'hasOwnProperty';

import { MODE_ALL } from 'enforceKeywords';
import { isEmpty } from 'isEmpty';
import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';
import runCompoundChain from 'runCompoundChain';
import withArgs from 'withArgs';

/**
 * @param {Array} ObjectEntry   Object and key leading to current value
 * @param {Function[]} rules    Rules to validate the value with
 */
function optional(inputObject, ruleGroups) {
  const { obj, key } = inputObject;

  // If current value is not defined, undefined or null
  // Pass without further assertions
  if (!hasOwnProperty(obj, key) || isUndefined(obj[key] || isNull(obj[key]))) {
    return true;
  }

  // Pass if exists but no assertions
  if (isEmpty(ruleGroups)) {
    return true;
  }

  // Run chain with `all` mode
  return runCompoundChain(obj[key], ruleGroups, { mode: MODE_ALL });
}

export default withArgs(optional);
