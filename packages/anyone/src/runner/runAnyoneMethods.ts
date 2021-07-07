import isFunction from 'isFunction';

/**
 * Accepts a value or a function, and coerces it into a boolean value
 */
export default function run(arg: any): boolean {
  if (isFunction(arg)) {
    try {
      return check(arg());
    } catch (err) {
      return false;
    }
  }

  return check(arg);
}

function check(value: any): boolean {
  return Array.isArray(value) ? true : value != false && Boolean(value); // eslint-disable-line
}
