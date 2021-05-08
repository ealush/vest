import assign from 'assign';

/**
 * Stores values and configuration passed down to compound rules.
 *
 * @param {Object} content
 */
export default function EnforceContext(content) {
  assign(this, content);
}

/**
 * Sets an EnforceContext config `failFast`
 *
 * @param {Boolean} failFast
 * @return {EnforceContext}
 */
EnforceContext.prototype.setFailFast = function (failFast) {
  this.failFast = !!failFast;
  return this;
};

/**
 * Extracts the literal value from an EnforceContext object
 * @param {*} value
 * @return {*}
 */
EnforceContext.unwrap = function unwrap(value) {
  return EnforceContext.is(value) ? value.value : value;
};

/**
 * Wraps a literal value within a context.
 * @param {*} value
 * @return {EnforceContext}
 */
EnforceContext.wrap = function wrap(value) {
  return EnforceContext.is(value) ? value : new EnforceContext({ value });
};

/**
 * Checks whether a given value is an EnforceContext instance
 *
 * @param {*} value
 * @returns {boolean}
 */
EnforceContext.is = function is(value) {
  return value instanceof EnforceContext;
};
