import isFunction from 'isFunction';

/**
 * Takes a value. If it is a function, runs it and returns the result.
 * Otherwise, returns the value as is.
 *
 * @param {Function|*} value    Value to return. Run it if a function.
 * @param {Any[]} [args]        Arguments to pass if a function
 * @return {Any}
 */
export default function optionalFunctionValue(value, args) {
  return isFunction(value) ? value.apply(null, args) : value;
}
