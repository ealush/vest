import promisify from '../../../utilities/promisify';
import create from '../create';

/**
 * Creates a suite and immediately invokes it.
 * @param {string} suiteName
 * @param {Function} tests
 */
export default function validate(...args) {
  return promisify(create(...args))();
}
