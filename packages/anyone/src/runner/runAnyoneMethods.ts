import { isFunction } from 'vest-utils';

/**
 * Accepts a value or a function, and coerces it into a boolean value
 */
export default function run(arg: unknown): boolean {
  if (isFunction(arg)) {
    try {
      return check(arg());
    } catch (err) {
      return false;
    }
  }

  return check(arg);
}

function check(value: unknown): boolean {
  // We use abstract equality intentionally here. This enables falsy valueOf support.
  return Array.isArray(value) ? true : value != false && Boolean(value); // eslint-disable-line
}
