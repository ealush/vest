/**
 * Flattens inputs and filters out falsy values.
 * @param {...any} values Values or arrays of values to concatenate.
 * @returns {any[]} All truthy values from the provided inputs.
 */
export default function concatTruthy(...values) {
  return [].concat(...values).filter(Boolean);
}
