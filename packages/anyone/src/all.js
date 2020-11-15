import run from 'runAnyoneMethods';

/**
 * Checks that at all passed arguments evaluate to a truthy value.
 * @param  {[]*} [args] Any amount of values or expressions.
 * @returns {Boolean}
 */
const all = (...args) => args.every(run);

export default all;
