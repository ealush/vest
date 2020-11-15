/**
 * Accepts a value or a function, and coerces it into a boolean value
 * @param {*|Function} [arg] Any expression or value
 * @return {Boolean}
 */
const run = arg => {
  if (typeof arg === 'function') {
    try {
      return check(arg());
    } catch (err) {
      return false;
    }
  }

  return check(arg);
};

const check = value =>
  Array.isArray(value) ? true : value != false && Boolean(value); // eslint-disable-line

export default run;
