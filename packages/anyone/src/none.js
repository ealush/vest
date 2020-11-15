import run from 'runAnyoneMethods';

/**
 * Checks that at none of the passed arguments evaluate to a truthy value.
 * @param  {[]*} [args] Any amount of values or expressions.
 * @returns {Boolean}
 */
const none = (...args) => args.every(arg => !run(arg));

export default none;
