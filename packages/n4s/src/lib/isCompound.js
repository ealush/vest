import hasOwnProperty from 'hasOwnProperty';

import compounds from 'compounds';
/**
 * Determines whether a given rule is a compound.
 *
 * @param {Function} rule
 * @return {boolean}
 */
export default function isCompound(rule) {
  return hasOwnProperty(compounds, rule.name);
}
