/**
 * @param {*} value   Value to be test against rules
 * @param {Function[]} rules    Rules to validate the value with
 */
export default function anyOf(value, ...rules) {
  return !(rules.length) || rules.some(fn => fn(value));
}
